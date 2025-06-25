// message-created.args.ts

import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray, IsNotEmpty } from 'class-validator';

/**
 * MessageCreatedArgs
 *
 * GraphQL arguments for message creation subscription.
 * Contains an array of chat IDs to filter subscription events.
 * Used to limit real-time updates to only relevant chats.
 */
@ArgsType()
export class MessageCreatedArgs {
  @Field(() => [String])
  @IsArray()
  @IsNotEmpty({ each: true })
  chatIds: string[];
}
