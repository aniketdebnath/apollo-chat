// messages.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

/**
 * MessagesController
 *
 * REST controller for message-related operations.
 * Currently provides endpoints for message counting.
 * All endpoints require JWT authentication.
 */
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Counts messages in a specific chat
   *
   * @param chatId - ID of the chat to count messages for
   * @returns Object containing message count
   */
  @Get('count')
  @UseGuards(JwtAuthGuard)
  async countMessages(@Query('chatId') chatId: string) {
    return this.messagesService.countMessages(chatId);
  }
}
