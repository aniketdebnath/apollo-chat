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

interface MessageWithUser extends MessageDocument {
  user: any;
  chatId: string;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

      const messageDocument: MessageDocument = {
        content,
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
        _id: new Types.ObjectId(),
      };

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

      const user = await this.usersService.findOne(userId);
      const message: Message = {
        ...messageDocument,
        chatId,
        user,
      };

      await this.pubSub.publish(MESSAGE_CREATED, {
        messageCreated: message,
      });

      return message;
    } catch (error) {
      this.logger.error(`Failed to create message in chat ${chatId}:`, error);
      throw error;
    }
  }

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
