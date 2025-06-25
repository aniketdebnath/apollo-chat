// chats.resolver.ts
// GraphQL resolver for chat operations including queries, mutations, and subscriptions

import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { PaginationArgs } from '../common/dto/pagination-args.dto';
import { ChatMemberInput } from './dto/chat-member.input';
import { ChatTypeInput } from './dto/chat-type.input';
import { ChatPinInput } from './dto/chat-pin.input';
import { Inject } from '@nestjs/common';
import { PUB_SUB } from '../common/constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { CHAT_ADDED, CHAT_DELETED } from './constants/pubsub-triggers';

/**
 * Payload structure for chat-related subscriptions
 */
interface ChatPayload {
  chatAdded?: Chat;
  chatDeleted?: Chat;
}

/**
 * ChatsResolver
 *
 * GraphQL resolver for chat-related operations.
 * Provides endpoints for creating, querying, updating, and deleting chats,
 * as well as managing chat membership, types, and pinning status.
 */
@Resolver(() => Chat)
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  /**
   * Creates a new chat conversation
   *
   * @param createChatInput - DTO with chat details
   * @param user - Current authenticated user from JWT
   * @returns Newly created chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    const chat = await this.chatsService.create(createChatInput, user._id);
    this.pubSub.publish(CHAT_ADDED, { chatAdded: chat });
    return chat;
  }

  /**
   * Retrieves paginated chats for the current user
   *
   * @param paginationArgs - Arguments for pagination (skip, limit)
   * @param user - Current authenticated user from JWT
   * @returns Array of chat entities
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'chats' })
  async findAll(
    @Args() paginationArgs: PaginationArgs,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat[]> {
    return this.chatsService.findMany([], paginationArgs, user._id);
  }

  /**
   * Retrieves public chats for discovery
   *
   * @param user - Current authenticated user from JWT
   * @returns Array of public chat entities
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'publicChats' })
  async findPublicChats(@CurrentUser() user: TokenPayload): Promise<Chat[]> {
    return this.chatsService.findPublicChats(user._id);
  }

  /**
   * Retrieves a single chat by ID
   *
   * @param id - Chat ID to retrieve
   * @param user - Current authenticated user from JWT
   * @returns Chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => Chat, { name: 'chat' })
  async findOne(
    @Args('_id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.findOne(id, user._id);
  }

  /**
   * Debug endpoint for public chats
   * Includes additional logging for troubleshooting
   *
   * @param user - Current authenticated user from JWT
   * @returns Array of public chat entities
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'debugPublicChats' })
  async debugPublicChats(@CurrentUser() user: TokenPayload): Promise<Chat[]> {
    try {
      console.log('Debug: Starting debugPublicChats query');
      const chats = await this.chatsService.findPublicChats(user._id);
      console.log(`Debug: Returning ${chats.length} public chats`);
      return chats;
    } catch (error) {
      console.error('Debug: Error in debugPublicChats query:', error);
      throw error;
    }
  }

  /**
   * Allows a user to join a public or open chat
   *
   * @param chatId - ID of the chat to join
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async joinChat(
    @Args('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.joinChat(chatId, user._id);
  }

  /**
   * Adds a member to a chat
   *
   * @param chatMemberInput - DTO with chat ID and user ID
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async addChatMember(
    @Args('chatMemberInput') chatMemberInput: ChatMemberInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.addMember(chatMemberInput, user._id);
  }

  /**
   * Removes a member from a chat
   *
   * @param chatMemberInput - DTO with chat ID and user ID
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async removeChatMember(
    @Args('chatMemberInput') chatMemberInput: ChatMemberInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.removeMember(chatMemberInput, user._id);
  }

  /**
   * Updates a chat's visibility type
   *
   * @param chatTypeInput - DTO with chat ID and new type
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async updateChatType(
    @Args('chatTypeInput') chatTypeInput: ChatTypeInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.updateChatType(chatTypeInput, user._id);
  }

  /**
   * Pins a chat for the current user
   *
   * @param chatPinInput - DTO with chat ID to pin
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async pinChat(
    @Args('chatPinInput') chatPinInput: ChatPinInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.pinChat(chatPinInput.chatId, user._id);
  }

  /**
   * Unpins a chat for the current user
   *
   * @param chatPinInput - DTO with chat ID to unpin
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async unpinChat(
    @Args('chatPinInput') chatPinInput: ChatPinInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.unpinChat(chatPinInput.chatId, user._id);
  }

  /**
   * Updates a chat's metadata
   *
   * @param updateChatInput - DTO with chat ID and fields to update
   * @param user - Current authenticated user from JWT
   * @returns Updated chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async updateChat(
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.update(updateChatInput, user._id);
  }

  /**
   * Deletes a chat
   *
   * @param chatId - ID of the chat to delete
   * @param user - Current authenticated user from JWT
   * @returns Deleted chat entity
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async removeChat(
    @Args('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    const chat = await this.chatsService.remove(chatId, user._id);
    this.pubSub.publish(CHAT_DELETED, { chatDeleted: chat });
    return chat;
  }

  /**
   * Subscription for new chat creation
   *
   * @returns AsyncIterator for chat creation events
   */
  @Subscription(() => Chat, {
    filter: (payload: ChatPayload) => !!payload.chatAdded,
  })
  chatAdded() {
    return this.pubSub.asyncIterableIterator(CHAT_ADDED);
  }

  /**
   * Subscription for chat deletion
   *
   * @returns AsyncIterator for chat deletion events
   */
  @Subscription(() => Chat, {
    filter: (payload: ChatPayload) => !!payload.chatDeleted,
  })
  chatDeleted() {
    return this.pubSub.asyncIterableIterator(CHAT_DELETED);
  }
}
