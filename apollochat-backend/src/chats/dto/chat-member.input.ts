// chat-member.input.ts
// Input data for chat membership operations

import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * ChatMemberInput
 *
 * Input DTO for adding or removing members from a chat.
 * Contains both the chat ID and the target user ID.
 * Used for member management operations in the chats resolver.
 */
@InputType()
export class ChatMemberInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
