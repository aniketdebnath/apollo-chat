// create-message.input.ts

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

/**
 * CreateMessageInput
 *
 * Input DTO for creating new messages.
 * Contains the message content and target chat ID.
 * Both fields are required and validated with class-validator.
 */
@InputType()
export class CreateMessageInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsNotEmpty()
  chatId: string;
}
