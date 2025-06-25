//update-user.input.ts
//Data Transfer Object for updating an existing user.

import { CreateUserInput } from './create-user.input';
import { InputType, PartialType } from '@nestjs/graphql';

/**
 * Input type for user updates
 * All fields from CreateUserInput are made optional
 */
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
