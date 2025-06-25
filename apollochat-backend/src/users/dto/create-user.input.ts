//update-user.input.ts
//Data Transfer Object for creating a new user.

import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

/**
 * Input type for user creation
 * Contains validation rules for email, username, and password.
 */
@InputType()
export class CreateUserInput {
  /**
   * User's email address (must be valid email format)
   */
  @Field()
  @IsEmail()
  email: string;

  /**
   * User's display name (cannot be empty)
   */
  @Field()
  @IsNotEmpty()
  username: string;

  /**
   * User's password (must meet strong password requirements)
   */
  @Field()
  @IsStrongPassword()
  password: string;
}
