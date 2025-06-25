// message.entity.ts

import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from '../../../common/database/abstract.entity';
import { User } from '../../../users/entities/user.entity';

/**
 * Message
 *
 * GraphQL entity representing a chat message in the system.
 * Extends AbstractEntity to inherit _id field.
 * Provides fields for content, timestamp, author, and chat relationship.
 */
@ObjectType()
export class Message extends AbstractEntity {
  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  user: User;

  @Field()
  chatId: string;
}
