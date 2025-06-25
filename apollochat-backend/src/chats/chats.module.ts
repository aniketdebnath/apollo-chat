// chats.module.ts
// Module definition for chat functionality

import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { ChatsRepository } from './chats.repository';
import { DatabaseModule } from '../common/database/database.module';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from './messages/messages.module';
import { ChatSchema } from './entities/chat.document';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';

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
    DatabaseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
    UsersModule,
  ],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
  exports: [ChatsRepository],
  controllers: [ChatsController],
})
export class ChatsModule {}
