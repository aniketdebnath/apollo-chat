import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { BanDuration } from '../constants/ban-duration.enum';

@InputType()
export class ChatBanInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => String)
  @IsEnum(BanDuration)
  duration: BanDuration;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
