// messages.resolver.ts
// GraphQL resolver for message operations including queries, mutations, and subscriptions

import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TokenPayload } from '../../auth/interfaces/token-payload.interface';
import { GetMessagesArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';

/**
 * Payload structure for message creation subscription
 */
interface MessageCreatedPayload {
  messageCreated: Message;
}

/**
 * GraphQL subscription context with user information
 */
interface SubscriptionContext {
  req: {
    user: {
      _id: string;
    };
  };
}

/**
 * MessagesResolver
 *
 * GraphQL resolver for message-related operations.
 * Provides endpoints for creating messages, fetching message history,
 * and subscribing to real-time message updates.
 */
@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Creates a new message in a chat
   *
   * @param createMessageInput - DTO with message content and target chat
   * @param user - Current authenticated user from JWT
   * @returns Newly created message entity
   */
  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Message> {
    return this.messagesService.createMessage(createMessageInput, user._id);
  }

  /**
   * Retrieves paginated messages from a specific chat
   *
   * @param getMessageArgs - Arguments containing chatId and pagination params
   * @param _user - Current authenticated user (unused but required for auth)
   * @returns Array of message entities
   */
  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  async getMessages(
    @Args() getMessageArgs: GetMessagesArgs,
    // We don't use user directly but it's required for authentication
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: TokenPayload,
  ): Promise<Message[]> {
    // Type assertion to Message[] is needed because the aggregate returns a generic type
    return this.messagesService.getMessages(getMessageArgs);
  }

  /**
   * Subscription for real-time message updates
   *
   * Filters messages based on:
   * 1. Chat membership (chatIds parameter)
   * 2. Excludes messages sent by the current user
   *
   * @param args - Arguments containing chatIds to subscribe to
   * @returns AsyncIterator for message creation events
   */
  @Subscription(() => Message, {
    filter: (
      payload: MessageCreatedPayload,
      variables: MessageCreatedArgs,
      context: SubscriptionContext,
    ) => {
      const userId = String(context.req.user._id);
      const { messageCreated } = payload;
      const messageUserId = String(messageCreated.user._id);

      return (
        variables.chatIds.includes(messageCreated.chatId) &&
        userId !== messageUserId
      );
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  messageCreated(@Args() args: MessageCreatedArgs) {
    return this.messagesService.messageCreated();
  }
}
