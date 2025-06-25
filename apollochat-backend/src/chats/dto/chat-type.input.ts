// chat-type.input.ts
// Input data for changing chat visibility type

import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

/**
 * ChatTypeInput
 *
 * Input DTO for updating a chat's visibility type.
 * Supports changing between private, public, and open types.
 * Validates that the type is one of the allowed enum values.
 */
@InputType()
export class ChatTypeInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(['private', 'public', 'open'])
  type: string;
}
