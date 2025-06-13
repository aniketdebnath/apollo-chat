import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';

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
