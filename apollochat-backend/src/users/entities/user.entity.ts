import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AbstractEntity } from '../../common/database/abstract.entity';
import { UserStatus } from '../constants/user-status.enum';

// Register the UserStatus enum with GraphQL
registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'Available user status options',
});

@ObjectType()
export class User extends AbstractEntity {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  imageUrl: string;

  @Field(() => UserStatus, { defaultValue: UserStatus.OFFLINE })
  status: UserStatus;
}
