// chats.module.ts
// Module definition for chat functionality

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';
import { ChatsRepository } from './chats.repository';
import { ChatSchema } from './entities/chat.document';
import { PubSubModule } from '../common/pubsub/pubsub.module';
import { MessagesModule } from './messages/messages.module';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';
import { BanCleanupService } from './ban-cleanup.service';
import { Chat } from './entities/chat.entity';

/**
 * ChatsModule
 *
 * Provides functionality for chat management including:
 * - Chat creation and discovery
 * - Member management
 * - Chat type and visibility control
 * - Chat pinning
 *
 * Uses circular dependency with MessagesModule (forwardRef)
 * and depends on UsersModule for user data.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    PubSubModule,
    forwardRef(() => MessagesModule),
    UsersModule,
  ],
  providers: [ChatsResolver, ChatsService, ChatsRepository, BanCleanupService],
  exports: [ChatsRepository],
  controllers: [ChatsController],
})
export class ChatsModule {}
