import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ChatPinInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  chatId: string;
}
