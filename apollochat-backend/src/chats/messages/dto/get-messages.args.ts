// get-messages.args.ts

import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { PaginationArgs } from '../../../common/dto/pagination-args.dto';

/**
 * GetMessagesArgs
 *
 * GraphQL arguments for retrieving messages from a specific chat.
 * Extends PaginationArgs to inherit skip and limit fields for pagination.
 * Requires a valid chatId to identify the target conversation.
 */
@ArgsType()
export class GetMessagesArgs extends PaginationArgs {
  @Field()
  @IsNotEmpty()
  chatId: string;
}
