import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

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
