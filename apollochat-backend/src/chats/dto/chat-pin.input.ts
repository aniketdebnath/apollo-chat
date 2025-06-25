// chat-pin.input.ts
// Input data for chat pinning operations

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * ChatPinInput
 *
 * Input DTO for pinning or unpinning a chat.
 * Contains only the chat ID to be pinned/unpinned.
 * Used by both pinChat and unpinChat mutations.
 */
@InputType()
export class ChatPinInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  chatId: string;
}
