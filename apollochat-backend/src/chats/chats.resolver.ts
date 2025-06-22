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

interface ChatPayload {
  chatAdded?: Chat;
  chatDeleted?: Chat;
}

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'chats' })
  async findAll(
    @Args() paginationArgs: PaginationArgs,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat[]> {
    return this.chatsService.findMany([], paginationArgs, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Chat], { name: 'publicChats' })
  async findPublicChats(@CurrentUser() user: TokenPayload): Promise<Chat[]> {
    return this.chatsService.findPublicChats(user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Chat, { name: 'chat' })
  async findOne(
    @Args('_id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.findOne(id, user._id);
  }

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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async joinChat(
    @Args('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.joinChat(chatId, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async addChatMember(
    @Args('chatMemberInput') chatMemberInput: ChatMemberInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.addMember(chatMemberInput, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async removeChatMember(
    @Args('chatMemberInput') chatMemberInput: ChatMemberInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.removeMember(chatMemberInput, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async updateChatType(
    @Args('chatTypeInput') chatTypeInput: ChatTypeInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.updateChatType(chatTypeInput, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async pinChat(
    @Args('chatPinInput') chatPinInput: ChatPinInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.pinChat(chatPinInput.chatId, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async unpinChat(
    @Args('chatPinInput') chatPinInput: ChatPinInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.unpinChat(chatPinInput.chatId, user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async updateChat(
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.update(updateChatInput, user._id);
  }

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

  @Subscription(() => Chat, {
    filter: (payload: ChatPayload) => !!payload.chatAdded,
  })
  chatAdded() {
    return this.pubSub.asyncIterableIterator(CHAT_ADDED);
  }

  @Subscription(() => Chat, {
    filter: (payload: ChatPayload) => !!payload.chatDeleted,
  })
  chatDeleted() {
    return this.pubSub.asyncIterableIterator(CHAT_DELETED);
  }
}
