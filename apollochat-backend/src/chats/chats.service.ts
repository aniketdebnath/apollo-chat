import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatsRepository } from './chats.repository';
import { PipelineStage, Types } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { PaginationArgs } from '../common/dto/pagination-args.dto';
import { UsersService } from '../users/users.service';
import { ChatMemberInput } from './dto/chat-member.input';
import { ChatTypeInput } from './dto/chat-type.input';
import { ChatDocument } from './entities/chat.document';
// User entity is used in the interface type definition

import { User } from '../users/entities/user.entity';

// Define interface for chat with latest message
interface ChatWithLatestMessage extends Omit<ChatDocument, 'messages'> {
  latestMessage?: {
    _id: string;
    content: string;
    createdAt: Date;
    user?: any; // This will be replaced with a User entity
    chatId?: string;
    userId?: string;
  };
  creator?: any;
  messages?: any[]; // Make messages optional since we're unsetting it
  isPinned?: boolean;
}

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createChatInput: CreateChatInput,
    userId: string,
  ): Promise<Chat> {
    try {
      // Initialize the members array with creator
      const members = [new Types.ObjectId(userId)];

      // Add additional members if specified
      if (createChatInput.memberIds?.length) {
        createChatInput.memberIds.forEach((memberId) => {
          if (memberId !== userId) {
            members.push(new Types.ObjectId(memberId));
          }
        });
      }

      // We need to use type assertion here because the document model
      // doesn't match the GraphQL entity exactly (members are ObjectIds in document, Users in entity)
      const chatDocument = await this.chatsRepository.create({
        ...createChatInput,
        creatorId: userId, // Use creatorId instead of userId
        members, // Add members array
        type: createChatInput.type || 'private', // Set type with default
        messages: [],
        pinnedBy: new Map<string, boolean>(), // Initialize empty pinnedBy map
      });

      // After creation, find and return the chat with populated fields
      // Make sure we're passing the string representation of the ID
      return this.findOne(chatDocument._id.toString(), userId);
    } catch (error) {
      this.logger.error(`Failed to create chat for user ${userId}:`, error);
      throw error;
    }
  }

  async findMany(
    prePipeLineStages: PipelineStage[] = [],
    paginationArgs?: PaginationArgs,
    userId?: string,
  ): Promise<Chat[]> {
    try {
      // Filter accessible chats based on user
      const accessFilter = userId
        ? {
            $or: [
              { members: new Types.ObjectId(userId) }, // User is a member
              { creatorId: userId }, // User is the creator
            ],
          }
        : {};

      // Use type assertion for MongoDB aggregation results
      const pipeline: PipelineStage[] = [
        { $match: accessFilter },
        ...prePipeLineStages,
        {
          $set: {
            latestMessage: {
              $cond: [
                '$messages',
                { $arrayElemAt: ['$messages', -1] },
                {
                  createdAt: new Date(),
                },
              ],
            },
            // Add isPinned field based on userId if available
            isPinned: userId
              ? {
                  $eq: [
                    {
                      $ifNull: [
                        { $getField: { field: userId, input: '$pinnedBy' } },
                        false,
                      ],
                    },
                    true,
                  ],
                }
              : false,
          },
        },
        // Sort by isPinned first (true first), then by latestMessage.createdAt
        {
          $sort: {
            isPinned: -1, // Sort by isPinned first (true values come first)
            'latestMessage.createdAt': -1, // Then by message date
          },
        },
      ];

      // Only add pagination if args are provided
      if (
        paginationArgs?.skip !== undefined &&
        paginationArgs?.limit !== undefined
      ) {
        pipeline.push(
          { $skip: paginationArgs.skip },
          { $limit: paginationArgs.limit },
        );
      }

      // Add remaining stages
      pipeline.push(
        { $unset: 'messages' },
        {
          $lookup: {
            from: 'users',
            localField: 'latestMessage.userId',
            foreignField: '_id',
            as: 'latestMessage.user',
          },
        },
        // Add lookup for creator
        {
          $lookup: {
            from: 'users',
            localField: 'creatorId',
            foreignField: '_id',
            as: 'creator',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  imageUrl: 1,
                  email: 1,
                  status: 1,
                },
              },
            ],
          },
        },
        // Add lookup for members
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  imageUrl: 1,
                  email: 1,
                  status: 1,
                },
              },
            ],
          },
        },
        // Unwind and set creator
        {
          $set: {
            creator: { $arrayElemAt: ['$creator', 0] },
          },
        },
      );

      const chats =
        await this.chatsRepository.model.aggregate<ChatWithLatestMessage>(
          pipeline,
        );

      // Process the chats to ensure proper structure
      const validChats = [];

      for (const chat of chats) {
        // Handle latestMessage
        if (!chat.latestMessage?._id) {
          delete chat.latestMessage;
        }

        // Make sure user exists before trying to access it
        if (
          chat.latestMessage?.user &&
          Array.isArray(chat.latestMessage.user) &&
          chat.latestMessage.user[0]
        ) {
          // Convert the user document to a User entity
          chat.latestMessage.user = this.usersService.toEntity(
            chat.latestMessage.user[0],
          );
        }

        if (chat.latestMessage) {
          delete chat.latestMessage.userId;
          chat.latestMessage.chatId = chat._id.toString();
        }

        // Make sure creator is properly transformed
        // This is critical since creator is non-nullable in the GraphQL schema
        if (!chat.creator && chat.creatorId) {
          try {
            // If creator lookup fails, try to get the user directly
            const creatorId = chat.creatorId.toString();
            const user = await this.usersService.findOne(creatorId);
            chat.creator = user;

            // If we still don't have a creator, skip this chat
            if (!chat.creator) {
              this.logger.warn(
                `Skipping chat ${chat._id.toString()} - could not find creator`,
              );
              continue;
            }
          } catch (err) {
            this.logger.error(
              `Failed to fetch creator for chat ${chat._id.toString()}:`,
              err,
            );
            // Skip this chat since we couldn't get a creator
            continue;
          }
        } else if (!chat.creator) {
          // If there's no creator and no creatorId, skip this chat
          this.logger.warn(
            `Skipping chat ${chat._id.toString()} with null creator`,
          );
          continue;
        }

        // Process members to ensure they have valid imageUrl fields
        if (Array.isArray(chat.members)) {
          const processedMembers: User[] = [];

          for (const member of chat.members) {
            if (member) {
              try {
                // Check if member is an ObjectId or has an _id property
                const memberId =
                  member instanceof Types.ObjectId
                    ? member.toString()
                    : (member as any)._id?.toString();

                if (memberId) {
                  const userDoc = await this.usersService.findOne(memberId);
                  if (userDoc) {
                    processedMembers.push(userDoc);
                  }
                } else {
                  // It's already a user document, just process it
                  const processedMember = this.usersService.toEntity(
                    member as any,
                  );
                  if (processedMember) {
                    processedMembers.push(processedMember);
                  }
                }
              } catch (err) {
                this.logger.warn(
                  `Failed to process member: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
            }
          }

          chat.members = processedMembers as any;
        }

        // Ensure creator imageUrl is never null
        if (chat.creator && !chat.creator.imageUrl) {
          chat.creator.imageUrl =
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        }

        validChats.push(chat);
      }

      return validChats as unknown as Chat[];
    } catch (error) {
      this.logger.error(`Failed to find chats:`, error);
      throw error;
    }
  }

  async findOne(_id: string, userId?: string): Promise<Chat> {
    try {
      // First try using the aggregation pipeline
      const chats = await this.findMany(
        [{ $match: { _id: new Types.ObjectId(_id) } }],
        undefined,
        userId,
      );

      if (chats[0]) {
        return chats[0];
      }

      // If no chat was found through the pipeline, try a direct lookup
      // This is important for newly created chats that might be filtered out by the pipeline
      const chatDocument = await this.chatsRepository.findOne({
        _id: new Types.ObjectId(_id),
      });

      if (!chatDocument) {
        throw new NotFoundException(`No chat was found with ID ${_id}`);
      }

      // Manually populate the creator
      const creator = await this.usersService.findOne(
        chatDocument.creatorId.toString(),
      );

      if (!creator) {
        throw new NotFoundException(
          `Creator not found for chat with ID ${_id}`,
        );
      }

      // Manually populate members
      const memberIds = chatDocument.members.map((m) => m.toString());
      const members = await Promise.all(
        memberIds.map((id) => this.usersService.findOne(id)),
      );

      // Create a chat entity with the necessary fields
      const chat = {
        _id: chatDocument._id.toString(),
        name: chatDocument.name,
        type: chatDocument.type || 'private',
        creator: creator,
        members: members,
        isPinned: chatDocument.pinnedBy?.get(userId) || false,
      } as unknown as Chat;

      return chat;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find chat with ID ${_id}:`, error);
      throw new NotFoundException(`Error finding chat with ID ${_id}`);
    }
  }

  /**
   * Join a public or open chat
   * @param chatId - ID of the chat to join
   * @param userId - ID of the user joining the chat
   * @returns The updated chat with the user added as a member
   * @throws ForbiddenException if the chat is private
   * @throws NotFoundException if the chat doesn't exist
   */
  async joinChat(chatId: string, userId: string): Promise<Chat> {
    // Find the chat and verify it's public or open
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
    });

    if (!chat) {
      throw new NotFoundException(`Chat not found with ID ${chatId}`);
    }

    // Check if the chat is public or open
    if (chat.type !== 'public' && chat.type !== 'open') {
      throw new ForbiddenException(
        'Cannot join a private chat. You must be invited by the creator.',
      );
    }

    // Check if the user is already a member
    if (chat.members.some((member) => member.toString() === userId)) {
      // User is already a member, just return the chat
      return this.findOne(chatId, userId);
    }

    // Add the user to the members array
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $push: { members: new Types.ObjectId(userId) } },
    );

    // Return the updated chat
    return this.findOne(chatId, userId);
  }

  // Member management methods
  async addMember(
    chatMemberInput: ChatMemberInput,
    currentUserId: string,
  ): Promise<Chat> {
    const { chatId, userId } = chatMemberInput;

    // Check if current user is the creator or if chat is public/open
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      $or: [
        { creatorId: currentUserId },
        { type: { $in: ['public', 'open'] } },
      ],
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to add members`,
      );
    }

    // Add user to members if not already a member
    if (!chat.members.some((member) => member.toString() === userId)) {
      await this.chatsRepository.model.updateOne(
        { _id: new Types.ObjectId(chatId) },
        { $push: { members: new Types.ObjectId(userId) } },
      );
    }

    return this.findOne(chatId, currentUserId);
  }

  async removeMember(
    chatMemberInput: ChatMemberInput,
    currentUserId: string,
  ): Promise<Chat> {
    const { chatId, userId } = chatMemberInput;

    // Only creator can remove members or users can remove themselves
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      $or: [
        { creatorId: currentUserId },
        {
          _id: new Types.ObjectId(chatId),
          members: new Types.ObjectId(currentUserId),
        },
      ],
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to remove members`,
      );
    }

    // Only allow self-removal or if current user is creator
    if (userId !== currentUserId && chat.creatorId !== currentUserId) {
      throw new NotFoundException(
        `You can only remove yourself unless you are the creator`,
      );
    }

    // Store chat data before removal for self-removal case
    const chatBeforeRemoval = { ...chat.toObject() };

    // Remove user from members
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $pull: { members: new Types.ObjectId(userId) } },
    );

    // If user is removing themselves and they're not the creator,
    // they won't have access to the chat anymore, so return the chat data we saved
    if (userId === currentUserId && chat.creatorId !== currentUserId) {
      // Convert the saved chat document to a Chat entity
      // We need to manually handle this since findOne would fail (user no longer has access)
      const chatEntity = {
        _id: chatBeforeRemoval._id.toString(),
        name: chatBeforeRemoval.name,
        type: chatBeforeRemoval.type,
        // We don't need to include messages, members, etc. since we're just confirming removal
      } as unknown as Chat;

      return chatEntity;
    }

    // For other cases (creator removing someone else or creator removing self),
    // return the updated chat as normal
    return this.findOne(chatId, currentUserId);
  }

  async updateChatType(
    chatTypeInput: ChatTypeInput,
    currentUserId: string,
  ): Promise<Chat> {
    const { chatId, type } = chatTypeInput;

    // Only creator can change chat type
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      creatorId: currentUserId,
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to change type`,
      );
    }

    // Update chat type
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { type } },
    );

    return this.findOne(chatId, currentUserId);
  }

  /**
   * Pin a chat for a specific user
   * @param chatId - ID of the chat to pin
   * @param userId - ID of the user pinning the chat
   * @returns The updated chat with isPinned set to true
   */
  async pinChat(chatId: string, userId: string): Promise<Chat> {
    // First check if the chat exists and the user has access to it
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      $or: [{ members: new Types.ObjectId(userId) }, { creatorId: userId }],
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to pin it`,
      );
    }

    // Update the pinnedBy map to set this user's pinned status to true
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { [`pinnedBy.${userId}`]: true } },
    );

    // Return the updated chat
    return this.findOne(chatId, userId);
  }

  /**
   * Unpin a chat for a specific user
   * @param chatId - ID of the chat to unpin
   * @param userId - ID of the user unpinning the chat
   * @returns The updated chat with isPinned set to false
   */
  async unpinChat(chatId: string, userId: string): Promise<Chat> {
    // First check if the chat exists and the user has access to it
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      $or: [{ members: new Types.ObjectId(userId) }, { creatorId: userId }],
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to unpin it`,
      );
    }

    // Update the pinnedBy map to set this user's pinned status to false
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { [`pinnedBy.${userId}`]: false } },
    );

    // Return the updated chat
    return this.findOne(chatId, userId);
  }

  // TODO: Implement proper chat update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateChatInput: UpdateChatInput): string {
    return `This action updates a #${id} chat`;
  }

  // TODO: Implement proper chat removal
  remove(id: number): string {
    return `This action removes a #${id} chat`;
  }

  async countChats() {
    return this.chatsRepository.model.countDocuments({});
  }

  /**
   * Find all public and open chats for the explore page
   * @param userId Optional user ID to filter out chats where the user is a member or creator
   * @returns Array of public and open chats
   */
  async findPublicChats(userId?: string): Promise<Chat[]> {
    // Add debug logs
    this.logger.debug('Finding public chats');

    // Only match public or open chats, and filter out chats where the user is a member or creator
    const publicFilter = {
      type: { $in: ['public', 'open'] },
      ...(userId
        ? {
            $and: [
              { members: { $ne: new Types.ObjectId(userId) } }, // Not a member
              { creatorId: { $ne: userId } }, // Not the creator
            ],
          }
        : {}),
    };

    this.logger.debug(`Public filter: ${JSON.stringify(publicFilter)}`);

    // Use type assertion for MongoDB aggregation results
    const pipeline: PipelineStage[] = [
      { $match: publicFilter },
      {
        $set: {
          latestMessage: {
            $cond: [
              '$messages',
              { $arrayElemAt: ['$messages', -1] },
              {
                createdAt: new Date(),
              },
            ],
          },
          // Public chats are never pinned in the public listing
          isPinned: false,
        },
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
      { $unset: 'messages' },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.userId',
          foreignField: '_id',
          as: 'latestMessage.user',
        },
      },
      // Add lookup for creator
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                imageUrl: 1,
                email: 1,
                status: 1,
              },
            },
          ],
        },
      },
      // Add lookup for members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                imageUrl: 1,
                email: 1,
                status: 1,
              },
            },
          ],
        },
      },
      // Unwind and set creator
      {
        $set: {
          creator: { $arrayElemAt: ['$creator', 0] },
        },
      },
    ];

    const chats =
      await this.chatsRepository.model.aggregate<ChatWithLatestMessage>(
        pipeline,
      );

    // Add debug logs
    this.logger.debug(`Found ${chats.length} chats from aggregation`);
    for (const chat of chats) {
      this.logger.debug(
        `Processing chat: ${String(chat._id)}, creator: ${chat.creator ? 'exists' : 'missing'}, creatorId: ${String(chat.creatorId || 'undefined')}`,
      );
    }

    // Process the chats to ensure proper structure
    const processedChats = [];

    for (const chat of chats) {
      // MODIFIED: Don't skip chats with null creators immediately
      // Instead, try to fetch the creator first
      if (!chat.creator && chat.creatorId) {
        try {
          // This is a fallback in case the creator field wasn't populated
          const creator = await this.usersService.findOne(
            chat.creatorId.toString(),
          );
          chat.creator = creator;
        } catch (err) {
          this.logger.error(
            `Failed to fetch creator for public chat ${chat._id.toString()}:`,
            err,
          );
          // Continue processing even if we couldn't get the creator
          // We'll handle missing creator later
        }
      }

      // Process latestMessage
      if (!chat.latestMessage?._id) {
        delete chat.latestMessage;
      } else if (chat.latestMessage?.user?.[0]) {
        chat.latestMessage.user = this.usersService.toEntity(
          chat.latestMessage.user[0],
        );
        delete chat.latestMessage.userId;
        chat.latestMessage.chatId = chat._id.toString();
      }

      // MODIFIED: If we still don't have a creator, create a placeholder
      if (!chat.creator) {
        this.logger.warn(
          `Creating placeholder creator for chat ${chat._id.toString()}`,
        );
        chat.creator = {
          _id: chat.creatorId || 'unknown',
          username: 'Unknown User',
          email: 'unknown@example.com',
          imageUrl:
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          status: 'OFFLINE',
        };
      }

      // Process members to ensure they have valid imageUrl fields
      if (Array.isArray(chat.members)) {
        const processedMembers: User[] = [];

        for (const member of chat.members) {
          if (member) {
            try {
              // Check if member is an ObjectId or has an _id property
              const memberId =
                member instanceof Types.ObjectId
                  ? member.toString()
                  : (member as any)._id?.toString();

              if (memberId) {
                const userDoc = await this.usersService.findOne(memberId);
                if (userDoc) {
                  processedMembers.push(userDoc);
                }
              } else {
                // It's already a user document, just process it
                const processedMember = this.usersService.toEntity(
                  member as any,
                );
                if (processedMember) {
                  processedMembers.push(processedMember);
                }
              }
            } catch (err) {
              this.logger.warn(
                `Failed to process member: ${err instanceof Error ? err.message : String(err)}`,
              );
            }
          }
        }

        chat.members = processedMembers as any;
      }

      // Ensure creator imageUrl is never null
      if (chat.creator && !chat.creator.imageUrl) {
        chat.creator.imageUrl =
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      }

      processedChats.push(chat);
    }

    // Add debug logs
    this.logger.debug(
      `Returning ${processedChats.length} processed public chats`,
    );

    return processedChats as unknown as Chat[];
  }
}
