//update-status.input.ts
//Data Transfer Object for updating an existing user's status.
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../constants/user-status.enum';

/**
 * Input type for updating a user's status
 *
 * Contains validation to ensure the status is a valid UserStatus enum value
 */
@InputType()
export class UpdateStatusInput {
  /**
   * New status to set for the user
   * Must be a valid UserStatus enum value (ONLINE, AWAY, DND, OFFLINE)
   */
  @Field(() => UserStatus)
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
