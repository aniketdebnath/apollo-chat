// chats.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';

/**
 * ChatsController
 *
 * REST controller for chat-related operations.
 * Currently provides endpoints for chat statistics.
 * All endpoints require JWT authentication.
 */
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * Counts the total number of chats in the system
   *
   * @returns Object containing chat count
   */
  @Get('count')
  @UseGuards(JwtAuthGuard)
  async countChats() {
    return this.chatsService.countChats();
  }
}
