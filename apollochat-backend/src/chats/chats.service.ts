import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatsRepository } from './chats.repository';
import { PipelineStage, Types } from 'mongoose';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async create(
    createChatInput: CreateChatInput,
    userId: string,
  ): Promise<Chat> {
    return this.chatsRepository.create({
      ...createChatInput,
      userId,
      messages: [],
    });
  }

  async findMany(prePipeLineStages: PipelineStage[] = []): Promise<Chat[]> {
    // Use type assertion for MongoDB aggregation results

    const chats = await this.chatsRepository.model.aggregate<any>([
      ...prePipeLineStages,
      { $set: { latestMessage: { $arrayElemAt: ['$messages', -1] } } },
      { $unset: 'messages' },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.userId',
          foreignField: '_id',
          as: 'latestMessage.user',
        },
      },
    ]);

    // Process the chats to ensure proper structure
    // Suppress typescript errors for any type in this block since we're working with MongoDB aggregation results

    chats.forEach((chat: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!chat.latestMessage?._id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete chat.latestMessage;
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      chat.latestMessage.user = chat.latestMessage.user[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete chat.latestMessage.userId;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      chat.latestMessage.chatId = chat._id;
    });

    return chats as unknown as Chat[];
  }

  async findOne(_id: string): Promise<Chat> {
    const chats = await this.findMany([
      { $match: { _id: new Types.ObjectId(_id) } },
    ]);
    if (!chats[0]) {
      throw new NotFoundException(`No chat was found with ID ${_id}`);
    }
    return chats[0];
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

  userChatFilter(userId: string) {
    return {
      $or: [{ creatorId: userId }, { recipientId: userId }],
    };
  }
}
