import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';
import { GetMessagesArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';

interface MessageCreatedPayload {
  messageCreated: Message;
}

interface SubscriptionContext {
  req: {
    user: {
      _id: string;
    };
  };
}

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<Message> {
    return this.messagesService.createMessage(createMessageInput, user._id);
  }

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  async getMessages(
    @Args() getMessageArgs: GetMessagesArgs,
    // We don't use user directly but it's required for authentication
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: TokenPayload,
  ): Promise<Message[]> {
    // Type assertion to Message[] is needed because the aggregate returns a generic type
    return this.messagesService.getMessages(getMessageArgs) as Promise<
      Message[]
    >;
  }

  @Subscription(() => Message, {
    filter: (
      payload: MessageCreatedPayload,
      variables: MessageCreatedArgs,
      context: SubscriptionContext,
    ) => {
      const userId = context.req.user._id;
      const { messageCreated } = payload;
      return (
        variables.chatIds.includes(messageCreated.chatId) &&
        userId !== messageCreated.user._id.toHexString()
      );
    },
  })
  messageCreated(@Args() _messageCreatedArgs: MessageCreatedArgs) {
    return this.messagesService.messageCreated();
  }
}
