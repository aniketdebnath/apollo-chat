// messages.service.ts
// Business logic for message operations: creation, retrieval, and real-time updates

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChatsRepository } from '../chats.repository';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './entities/message.entity';
import { Types } from 'mongoose';
import { GetMessagesArgs } from './dto/get-messages.args';
import { PUB_SUB } from '../../common/constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from './constants/pubsub-triggers';

import { MessageDocument } from './entities/message.document';
import { UsersService } from '../../users/users.service';

/**
 * Extended message document with user data and chat ID
 */
interface MessageWithUser extends MessageDocument {
  user: any;
  chatId: string;
}

/**
 * MessagesService
 *
 * Provides core business logic for message operations:
 * - Creating new messages in chats
 * - Retrieving message history with pagination
 * - Publishing real-time message updates
 * - Counting messages in a chat
 */
@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  /**
   * Creates a new message in a chat
   *
   * Validates chat existence and user membership before creating the message.
   * After creation, publishes the message to subscribers via PubSub.
   *
   * @param param0 - CreateMessageInput containing content and chatId
   * @param userId - ID of the user creating the message
   * @returns Created message entity with user data
   * @throws NotFoundException if chat doesn't exist or user isn't a member
   */
  async createMessage(
    { content, chatId }: CreateMessageInput,
    userId: string,
  ): Promise<Message> {
    try {
      // First check if the chat exists and the user has access to it
      const chat = await this.chatsRepository.findOne({
        _id: chatId,
        members: new Types.ObjectId(userId),
      });

      if (!chat) {
        throw new NotFoundException(
          `Chat not found or you don't have permission to send messages to it`,
        );
      }

      // Create message document with required fields
      const messageDocument: MessageDocument = {
        content,
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
        _id: new Types.ObjectId(),
      };

      // Add message to chat's messages array
      await this.chatsRepository.findOneAndUpdate(
        {
          _id: chatId,
        },
        {
          $push: {
            messages: messageDocument,
          },
        },
      );

      // Get user details and construct full message entity
      const user = await this.usersService.findOne(userId);
      const message: Message = {
        ...messageDocument,
        chatId,
        user,
      };

      // Publish message to subscribers
      await this.pubSub.publish(MESSAGE_CREATED, {
        messageCreated: message,
      });

      return message;
    } catch (error) {
      this.logger.error(`Failed to create message in chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves paginated messages from a chat
   *
   * Uses MongoDB aggregation pipeline to:
   * 1. Find the chat by ID
   * 2. Unwind the messages array
   * 3. Sort by creation date (newest first)
   * 4. Apply pagination (skip/limit)
   * 5. Lookup user data for each message
   *
   * @param param0 - GetMessagesArgs with chatId and pagination parameters
   * @returns Array of message entities with user data
   * @throws NotFoundException if chat doesn't exist
   */
  async getMessages({
    chatId,
    skip,
    limit,
  }: GetMessagesArgs): Promise<Message[]> {
    try {
      // First check if the chat exists
      const chatExists = await this.chatsRepository.findOne({ _id: chatId });
      if (!chatExists) {
        throw new NotFoundException(`Chat not found with ID ${chatId}`);
      }

      // Execute aggregation pipeline to get messages with user data
      const messages =
        await this.chatsRepository.model.aggregate<MessageWithUser>([
          { $match: { _id: new Types.ObjectId(chatId) } },
          { $unwind: '$messages' },
          { $replaceRoot: { newRoot: '$messages' } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          { $unset: 'userId' },
          { $set: { chatId } },
        ]);

      // Convert each message's user to a proper entity
      return messages.map((message) => {
        return {
          ...message,
          user: this.usersService.toEntity(message.user),
        } as unknown as Message;
      });
    } catch (error) {
      this.logger.error(`Failed to get messages for chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Counts the total number of messages in a chat
   *
   * Uses MongoDB aggregation to count messages in the chat's messages array.
   * Returns 0 if the chat has no messages or if an error occurs.
   *
   * @param chatId - ID of the chat to count messages for
   * @returns Object containing the message count
   */
  async countMessages(chatId: string): Promise<{ messages: number }> {
    try {
      const result = await this.chatsRepository.model.aggregate<{
        messages: number;
      }>([
        { $match: { _id: new Types.ObjectId(chatId) } },
        { $unwind: '$messages' },
        { $count: 'messages' },
      ]);

      // If no results (no messages), return count of 0
      if (!result || result.length === 0) {
        return { messages: 0 };
      }

      return result[0];
    } catch (error) {
      this.logger.error(`Error counting messages for chat ${chatId}:`, error);
      // Return 0 in case of error
      return { messages: 0 };
    }
  }

  /**
   * Creates an async iterator for message creation events
   *
   * Used by GraphQL subscriptions to listen for new messages.
   *
   * @returns AsyncIterator for message creation events
   */
  messageCreated() {
    try {
      // This method doesn't need to be async since it doesn't use await
      return this.pubSub.asyncIterableIterator(MESSAGE_CREATED);
    } catch (error) {
      this.logger.error('Error creating message subscription:', error);
      throw error;
    }
  }
}
