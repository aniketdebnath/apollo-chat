// chat.entity.ts
// GraphQL entity definition for chat conversations

import { ObjectType, Field } from '@nestjs/graphql';

import { AbstractEntity } from '../../common/database/abstract.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { BannedUser } from './banned-user.entity';

/**
 * Chat
 *
 * GraphQL entity representing a chat conversation.
 * Contains fields for chat metadata, members, messages, and pinning status.
 * Used for API responses in GraphQL operations.
 */
@ObjectType()
export class Chat extends AbstractEntity {
  @Field({ nullable: true })
  name: string;
  @Field(() => Message, { nullable: true })
  latestMessage?: Message;
  @Field(() => String)
  type: string;
  @Field(() => [User])
  members: User[];
  @Field(() => User, { nullable: true })
  creator: User;
  @Field(() => Boolean, { defaultValue: false })
  isPinned: boolean;
  @Field(() => [BannedUser], { nullable: true })
  bannedUsers?: BannedUser[];
}
