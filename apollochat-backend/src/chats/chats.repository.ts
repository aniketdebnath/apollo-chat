// chats.repository.ts
// Data access layer for chat documents in MongoDB

import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../common/database/abstract-repository';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './entities/chat.entity';
import { ChatDocument } from './entities/chat.document';

/**
 * ChatsRepository
 *
 * Repository for chat document operations in MongoDB.
 * Extends AbstractRepository to inherit common CRUD operations.
 * Provides specialized logging for chat-related database operations.
 */
@Injectable()
export class ChatsRepository extends AbstractRepository<ChatDocument> {
  protected readonly logger: Logger = new Logger(ChatsRepository.name);

  constructor(@InjectModel(Chat.name) chatModel: Model<ChatDocument>) {
    super(chatModel);
  }
}
