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
import { ChatDocument } from './entities/chat.document';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
  ) {}

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

    // We need to use type assertion here because the document model
    // doesn't match the GraphQL entity exactly (members are ObjectIds in document, Users in entity)
    const chatDocument = await this.chatsRepository.create({
      ...createChatInput,
      creatorId: userId, // Use creatorId instead of userId
      members, // Add members array
      type: createChatInput.type || 'private', // Set type with default
      messages: [],
    });

    // After creation, find and return the chat with populated fields
    // Make sure we're passing the string representation of the ID
    return this.findOne(chatDocument._id.toString(), userId);
  }

  async findMany(
    prePipeLineStages: PipelineStage[] = [],
    paginationArgs?: PaginationArgs,
    userId?: string,
  ): Promise<Chat[]> {
    // Filter accessible chats based on user
    const accessFilter = userId
      ? {
          $or: [
            { members: new Types.ObjectId(userId) }, // User is a member
            { creatorId: userId }, // User is the creator
            // Removed the following two lines to fix the chat privacy bug:
            // { type: 'open' }, // Chat is open to everyone
            // { type: 'public' }, // Chat is publicly visible
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
        },
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
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
            { $project: { _id: 1, username: 1, imageUrl: 1, email: 1 } },
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
            { $project: { _id: 1, username: 1, imageUrl: 1, email: 1 } },
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

    const chats = await this.chatsRepository.model.aggregate<any>(pipeline);

    // Process the chats to ensure proper structure
    chats.forEach((chat: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!chat.latestMessage?._id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete chat.latestMessage;
        return;
      }

      // Make sure user exists before trying to access it
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (chat.latestMessage?.user?.[0]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        chat.latestMessage.user = this.usersService.toEntity(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          chat.latestMessage.user[0],
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete chat.latestMessage.userId;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      chat.latestMessage.chatId = chat._id;

      // Make sure creator is properly transformed
      // This is critical since creator is non-nullable in the GraphQL schema
      if (!chat.creator) {
        // If creator lookup fails, try to get the user directly
        // We need to access creatorId from the raw MongoDB result
        const creatorId = chat.creatorId as string;
        if (creatorId) {
          this.usersService
            .findOne(creatorId)
            .then((user) => {
              chat.creator = user;
            })
            .catch((err) => {
              console.error(
                `Failed to fetch creator for chat ${chat._id}:`,
                err,
              );
            });
        }
      }
    });

    return chats as unknown as Chat[];
  }

  async findOne(_id: string, userId?: string): Promise<Chat> {
    // Pass an empty PaginationArgs object to findMany
    const chats = await this.findMany(
      [{ $match: { _id: new Types.ObjectId(_id) } }],
      undefined,
      userId,
    );

    if (!chats[0]) {
      throw new NotFoundException(`No chat was found with ID ${_id}`);
    }

    // Extra safety check for creator
    const chat = chats[0] as any; // Use type assertion to access raw document properties
    if (!chat.creator && chat.creatorId) {
      // This is a fallback in case the creator field wasn't populated
      const creator = await this.usersService.findOne(chat.creatorId);
      chat.creator = creator;
    }

    return chat as Chat;
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
   * @returns Array of public and open chats
   */
  async findPublicChats(): Promise<Chat[]> {
    // Only match public or open chats
    const publicFilter = {
      type: { $in: ['public', 'open'] },
    };

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
            { $project: { _id: 1, username: 1, imageUrl: 1, email: 1 } },
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
            { $project: { _id: 1, username: 1, imageUrl: 1, email: 1 } },
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

    const chats = await this.chatsRepository.model.aggregate<any>(pipeline);

    // Process the chats to ensure proper structure
    const processedChats = [];

    for (const chat of chats) {
      // Process latestMessage
      if (!chat.latestMessage?._id) {
        delete chat.latestMessage;
      } else if (chat.latestMessage?.user?.[0]) {
        chat.latestMessage.user = this.usersService.toEntity(
          chat.latestMessage.user[0],
        );
        delete chat.latestMessage.userId;
        chat.latestMessage.chatId = chat._id;
      }

      // Ensure creator is properly populated - THIS IS THE CRITICAL FIX
      if (!chat.creator && chat.creatorId) {
        try {
          // This is a fallback in case the creator field wasn't populated
          const creator = await this.usersService.findOne(chat.creatorId);
          chat.creator = creator;
        } catch (err) {
          console.error(`Failed to fetch creator for chat ${chat._id}:`, err);
          // Skip this chat since we can't return null for creator
          continue;
        }
      }

      // Only add chat if it has a valid creator
      if (chat.creator) {
        processedChats.push(chat);
      }
    }

    return processedChats as unknown as Chat[];
  }
}
