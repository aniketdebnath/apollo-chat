import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

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
