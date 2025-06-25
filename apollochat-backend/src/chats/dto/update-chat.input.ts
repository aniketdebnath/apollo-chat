// update-chat.input.ts
// Input data for chat modification operations

import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * UpdateChatInput
 *
 * Input DTO for updating existing chat conversations.
 * Currently supports updating the chat name.
 * Requires chat ID for targeting the specific chat to update.
 */
@InputType()
export class UpdateChatInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;
}
