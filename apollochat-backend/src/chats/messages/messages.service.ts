import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class MessagesService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
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
    const message: Message = {
      ...messageDocument,
      chatId,
      user: await this.usersService.findOne(userId),
    };
    await this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message,
    });
    return message;
  }

  async getMessages({ chatId, skip, limit }: GetMessagesArgs) {
    const messages = await this.chatsRepository.model.aggregate([
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
    const processedMessages = messages.map((message: any) => {
      if (message) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = { ...message };
        if (message.user) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          result.user = this.usersService.toEntity(message.user);
        }
        return result;
      }
      return message;
    });

    // Type assertion to safely return the messages
    return processedMessages as unknown as Message[];
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
      console.error(`Error counting messages for chat ${chatId}:`, error);
      // Return 0 in case of error
      return { messages: 0 };
    }
  }

  async messageCreated() {
    // Add await to fix the require-await error
    await Promise.resolve();
    return this.pubSub.asyncIterableIterator(MESSAGE_CREATED);
  }
}
