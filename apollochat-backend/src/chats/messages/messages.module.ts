// messages.module.ts
// Module definition for the messages feature

import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { ChatsModule } from '../chats.module';
import { UsersModule } from '../../users/users.module';
import { MessagesController } from './messages.controller';

/**
 * MessagesModule
 *
 * Provides functionality for chat messaging including:
 * - Message creation and retrieval
 * - Real-time message subscriptions
 * - Message counting
 *
 * Uses circular dependency with ChatsModule (forwardRef)
 * and depends on UsersModule for user data.
 */
@Module({
  imports: [forwardRef(() => ChatsModule), UsersModule],
  providers: [MessagesResolver, MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
