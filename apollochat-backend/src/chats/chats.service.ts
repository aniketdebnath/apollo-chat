//chats.service.ts
// Business logic for chat operations: creation, retrieval, and real-time updates
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { UserDocument } from '../users/entities/user.document';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/constants/user-status.enum';

/**
 * Extended chat document with latest message and user data
 */
interface ChatWithLatestMessage {
  _id: Types.ObjectId;
  creatorId: string;
  name: string;
  type: string;
  latestMessage?: {
    _id: string;
    content: string;
    createdAt: Date;
    user?: User | any[];
    chatId?: string;
    userId?: string;
  };
  creator?: User;
  members: Types.ObjectId[] | User[];
  isPinned?: boolean;
  pinnedBy?: Map<string, boolean>;
}

/**
 * ChatsService
 *
 * Provides core business logic for chat operations:
 * - Creating and updating chats
 * - Retrieving chats with filtering and pagination
 * - Managing chat membership
 * - Controlling chat visibility and types
 * - Chat pinning functionality
 */
@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a new chat conversation
   *
   * @param createChatInput - DTO with chat details and optional members
   * @param userId - ID of the user creating the chat
   * @returns Newly created chat entity
   */
  async create(
    createChatInput: CreateChatInput,
    userId: string,
  ): Promise<Chat> {
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

    const chatDocument = await this.chatsRepository.create({
      ...createChatInput,
      creatorId: userId,
      members,
      type: createChatInput.type || 'private',
      messages: [],
      pinnedBy: new Map<string, boolean>(),
    });

    return this.findOne(chatDocument._id.toString(), userId);
  }

  /**
   * Retrieves multiple chats with filtering and pagination
   *
   * Uses MongoDB aggregation pipeline for efficient querying and population
   * of related data (latest message, creator, members).
   *
   * @param prePipeLineStages - Additional pipeline stages to apply before core stages
   * @param paginationArgs - Optional pagination parameters
   * @param userId - ID of the user requesting chats (for access control)
   * @returns Array of chat entities with populated data
   */
  async findMany(
    prePipeLineStages: PipelineStage[] = [],
    paginationArgs?: PaginationArgs,
    userId?: string,
  ): Promise<Chat[]> {
    // Filter accessible chats based on user
    const accessFilter = userId
      ? {
          $or: [{ members: new Types.ObjectId(userId) }, { creatorId: userId }],
        }
      : {};

    // Core pipeline stages
    const pipeline: PipelineStage[] = [
      { $match: accessFilter },
      ...prePipeLineStages,
      {
        $set: {
          latestMessage: {
            $cond: [
              '$messages',
              { $arrayElemAt: ['$messages', -1] },
              { createdAt: new Date() },
            ],
          },
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
      {
        $sort: {
          isPinned: -1,
          'latestMessage.createdAt': -1,
        },
      },
    ];

    // Add pagination if provided
    if (
      paginationArgs?.skip !== undefined &&
      paginationArgs?.limit !== undefined
    ) {
      pipeline.push(
        { $skip: paginationArgs.skip },
        { $limit: paginationArgs.limit },
      );
    }

    // Add lookups for related data
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

    const validChats: Chat[] = [];

    // Process each chat to ensure proper structure and data
    for (const chat of chats) {
      // Handle latestMessage
      if (!chat.latestMessage?._id) {
        delete chat.latestMessage;
      }

      // Process latest message user
      if (
        chat.latestMessage?.user &&
        Array.isArray(chat.latestMessage.user) &&
        chat.latestMessage.user[0]
      ) {
        chat.latestMessage.user = this.usersService.toEntity(
          chat.latestMessage.user[0],
        );
      }

      if (chat.latestMessage) {
        delete chat.latestMessage.userId;
        chat.latestMessage.chatId = chat._id.toString();
      }

      // Ensure creator exists
      if (!chat.creator && chat.creatorId) {
        try {
          const creatorId = chat.creatorId.toString();
          const user = await this.usersService.findOne(creatorId);
          chat.creator = user;

          // Skip chats without creators
          if (!chat.creator) {
            continue;
          }
        } catch {
          // Skip this chat since we couldn't get a creator
          continue;
        }
      } else if (!chat.creator) {
        // Skip chats without creators
        continue;
      }

      // Process members
      if (Array.isArray(chat.members)) {
        const processedMembers: User[] = [];

        for (const member of chat.members) {
          if (member) {
            try {
              // Handle different types of member objects
              let memberId: string | undefined;

              if (member instanceof Types.ObjectId) {
                memberId = member.toString();
              } else if (typeof member === 'object') {
                // Check if it has _id property
                const memberObj = member as Record<string, any>;
                if (memberObj._id) {
                  memberId = memberObj._id.toString();
                }
              }

              if (memberId) {
                const userDoc = await this.usersService.findOne(memberId);
                if (userDoc) {
                  processedMembers.push(userDoc);
                }
              } else if (typeof member === 'object') {
                // Only try to convert if it's a proper user document
                const memberObj = member as Record<string, any>;
                if (memberObj.email && memberObj.username) {
                  // Use toEntity method directly instead of casting to UserDocument
                  const processedMember = this.usersService.toEntity(
                    memberObj as unknown as UserDocument,
                  );
                  if (processedMember) {
                    processedMembers.push(processedMember);
                  }
                }
              }
            } catch {
              // Continue processing other members
            }
          }
        }

        // Create a new chat object with the processed members
        const chatWithProcessedMembers = {
          ...chat,
          members: processedMembers,
        };

        validChats.push(chatWithProcessedMembers as unknown as Chat);
        continue;
      }

      // Ensure creator has an imageUrl
      if (chat.creator && !chat.creator.imageUrl) {
        chat.creator.imageUrl =
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      }

      validChats.push(chat as unknown as Chat);
    }

    return validChats;
  }

  /**
   * Retrieves a single chat by ID
   *
   * First attempts to use the aggregation pipeline for efficient data retrieval.
   * Falls back to direct document lookup and manual population if needed.
   *
   * @param _id - ID of the chat to retrieve
   * @param userId - ID of the user requesting the chat (for access control)
   * @returns Chat entity with populated data
   * @throws NotFoundException if chat doesn't exist or user lacks access
   */
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
      throw new NotFoundException(`Error finding chat with ID ${_id}`);
    }
  }

  /**
   * Allows a user to join a public or open chat
   *
   * @param chatId - ID of the chat to join
   * @param userId - ID of the user joining the chat
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist
   * @throws ForbiddenException if chat is private
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

  /**
   * Adds a member to a chat
   *
   * Verifies that the current user has permission to add members
   * (either as creator or for public/open chats).
   *
   * @param chatMemberInput - DTO with chat ID and user ID to add
   * @param currentUserId - ID of the user performing the action
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user lacks permission
   */
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

  /**
   * Removes a member from a chat
   *
   * Users can remove themselves, or the creator can remove any member.
   * Handles special case for self-removal to return data before access is lost.
   *
   * @param chatMemberInput - DTO with chat ID and user ID to remove
   * @param currentUserId - ID of the user performing the action
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user lacks permission
   */
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
      const chatEntity = {
        _id: chatBeforeRemoval._id.toString(),
        name: chatBeforeRemoval.name,
        type: chatBeforeRemoval.type,
      } as unknown as Chat;

      return chatEntity;
    }

    // For other cases (creator removing someone else or creator removing self),
    // return the updated chat as normal
    return this.findOne(chatId, currentUserId);
  }

  /**
   * Updates a chat's visibility type
   *
   * Only the creator can change a chat's type.
   *
   * @param chatTypeInput - DTO with chat ID and new type
   * @param currentUserId - ID of the user performing the action
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user isn't the creator
   */
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
   * Pins a chat for a specific user
   *
   * Pinned chats appear at the top of the user's chat list.
   * Pinning is user-specific and stored in a Map.
   *
   * @param chatId - ID of the chat to pin
   * @param userId - ID of the user pinning the chat
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user lacks access
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
   * Unpins a chat for a specific user
   *
   * @param chatId - ID of the chat to unpin
   * @param userId - ID of the user unpinning the chat
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user lacks access
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

  /**
   * Updates a chat's name
   *
   * Only the creator can update a chat's name.
   *
   * @param updateChatInput - Input containing chatId and new name
   * @param userId - ID of the user performing the update
   * @returns Updated chat entity
   * @throws NotFoundException if chat doesn't exist or user isn't the creator
   */
  async update(
    updateChatInput: UpdateChatInput,
    userId: string,
  ): Promise<Chat> {
    const { chatId, name } = updateChatInput;

    // Only creator can update chat name
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      creatorId: userId,
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to update it`,
      );
    }

    // Update chat name
    await this.chatsRepository.model.updateOne(
      { _id: new Types.ObjectId(chatId) },
      { $set: { name } },
    );

    return this.findOne(chatId, userId);
  }

  /**
   * Deletes a chat
   *
   * Only the creator can delete a chat.
   * Returns the deleted chat entity for notification purposes.
   *
   * @param chatId - ID of the chat to delete
   * @param userId - ID of the user performing the deletion
   * @returns Deleted chat entity
   * @throws NotFoundException if chat doesn't exist or user isn't the creator
   */
  async remove(chatId: string, userId: string): Promise<Chat> {
    // Only creator can delete a chat
    const chat = await this.chatsRepository.model.findOne({
      _id: new Types.ObjectId(chatId),
      creatorId: userId,
    });

    if (!chat) {
      throw new NotFoundException(
        `Chat not found or you don't have permission to delete it`,
      );
    }

    // Get the full chat entity with populated members before deletion
    const chatToDelete = await this.findOne(chatId, userId);

    if (!chatToDelete) {
      // This should ideally not happen if the above check passed
      throw new NotFoundException(`Chat with ID ${chatId} disappeared.`);
    }

    // Delete the chat
    await this.chatsRepository.model.deleteOne({
      _id: new Types.ObjectId(chatId),
    });

    return chatToDelete;
  }

  /**
   * Counts the total number of chats in the system
   *
   * @returns Promise resolving to the chat count
   */
  async countChats() {
    return this.chatsRepository.model.countDocuments({});
  }

  /**
   * Finds all public and open chats for the explore page
   *
   * Excludes chats where the user is already a member or creator.
   * Uses aggregation pipeline similar to findMany but with different filters.
   *
   * @param userId - ID of the current user (to exclude their chats)
   * @returns Array of public chat entities
   */
  async findPublicChats(userId?: string): Promise<Chat[]> {
    // Only match public or open chats, and filter out chats where the user is a member or creator
    const publicFilter = {
      type: { $in: ['public', 'open'] },
      ...(userId
        ? {
            $and: [
              { members: { $ne: new Types.ObjectId(userId) } },
              { creatorId: { $ne: userId } },
            ],
          }
        : {}),
    };

    // Core pipeline stages
    const pipeline: PipelineStage[] = [
      { $match: publicFilter },
      {
        $set: {
          latestMessage: {
            $cond: [
              '$messages',
              { $arrayElemAt: ['$messages', -1] },
              { createdAt: new Date() },
            ],
          },
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

    // Process the chats to ensure proper structure
    const processedChats: Chat[] = [];

    for (const chat of chats) {
      // Try to fetch the creator if not populated
      if (!chat.creator && chat.creatorId) {
        try {
          const creator = await this.usersService.findOne(
            chat.creatorId.toString(),
          );
          chat.creator = creator;
        } catch {
          // Continue processing even if we couldn't get the creator
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

      // Create a placeholder creator if needed
      if (!chat.creator) {
        // Create a placeholder user with proper User type
        const placeholderCreator: User = {
          _id: chat.creatorId?.toString() || 'unknown',
          username: 'Unknown User',
          email: 'unknown@example.com',
          imageUrl:
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          status: UserStatus.OFFLINE,
        } as unknown as User;

        chat.creator = placeholderCreator;
      }

      // Process members
      if (Array.isArray(chat.members)) {
        const processedMembers: User[] = [];

        for (const member of chat.members) {
          if (member) {
            try {
              // Handle different types of member objects
              let memberId: string | undefined;

              if (member instanceof Types.ObjectId) {
                memberId = member.toString();
              } else if (typeof member === 'object') {
                // Check if it has _id property
                const memberObj = member as Record<string, any>;
                if (memberObj._id) {
                  memberId = memberObj._id.toString();
                }
              }

              if (memberId) {
                const userDoc = await this.usersService.findOne(memberId);
                if (userDoc) {
                  processedMembers.push(userDoc);
                }
              } else if (typeof member === 'object') {
                // Only try to convert if it's a proper user document
                const memberObj = member as Record<string, any>;
                if (memberObj.email && memberObj.username) {
                  // Use toEntity method directly instead of casting to UserDocument
                  const processedMember = this.usersService.toEntity(
                    memberObj as unknown as UserDocument,
                  );
                  if (processedMember) {
                    processedMembers.push(processedMember);
                  }
                }
              }
            } catch {
              // Continue processing other members
            }
          }
        }

        // Create a new chat object with the processed members
        const chatWithProcessedMembers = {
          ...chat,
          members: processedMembers,
        };

        processedChats.push(chatWithProcessedMembers as unknown as Chat);
        continue;
      }

      // Ensure creator imageUrl is never null
      if (chat.creator && !chat.creator.imageUrl) {
        chat.creator.imageUrl =
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      }

      processedChats.push(chat as unknown as Chat);
    }

    return processedChats;
  }
}
