import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
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

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Chat)
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.create(createChatInput, user._id);
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
  async findPublicChats(): Promise<Chat[]> {
    return this.chatsService.findPublicChats();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Chat, { name: 'chat' })
  async findOne(
    @Args('_id') _id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Chat> {
    return this.chatsService.findOne(_id, user._id);
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

  @Mutation(() => Chat)
  updateChat(
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
  ): string {
    return this.chatsService.update(updateChatInput.id, updateChatInput);
  }

  @Mutation(() => Chat)
  removeChat(@Args('id', { type: () => Int }) id: number): string {
    return this.chatsService.remove(id);
  }
}
