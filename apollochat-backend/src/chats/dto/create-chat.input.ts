// create-chat.input.ts
// Input data for chat creation operations

import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';

/**
 * CreateChatInput
 *
 * Input DTO for creating new chat conversations.
 * Supports optional chat name, type selection, and initial members.
 * Validates inputs using class-validator decorators.
 */
@InputType()
export class CreateChatInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @Field(() => String, { defaultValue: 'private' })
  @IsNotEmpty()
  @IsEnum(['private', 'public', 'open'])
  @IsOptional()
  type?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  memberIds?: string[];
}
