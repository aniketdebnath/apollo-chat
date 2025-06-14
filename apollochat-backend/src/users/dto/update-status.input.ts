import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../constants/user-status.enum';

@InputType()
export class UpdateStatusInput {
  @Field(() => UserStatus)
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
