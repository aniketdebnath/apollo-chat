// user.entity.ts
// GraphQL user entity definition for Apollo Chat
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AbstractEntity } from '../../common/database/abstract.entity';
import { UserStatus } from '../constants/user-status.enum';

// Register the UserStatus enum with GraphQL
registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'Available user status options',
});

/**
 * User entity representing a user in the system
 *
 * Contains core user information exposed to the GraphQL API.
 * Note that sensitive fields like password are excluded from this entity.
 */
@ObjectType()
export class User extends AbstractEntity {
  /**
   * User's email address (unique identifier)
   */
  @Field()
  email: string;

  /**
   * User's display name
   */
  @Field()
  username: string;

  /**
   * URL to the user's profile image
   */
  @Field({ nullable: true })
  imageUrl: string;

  /**
   * Current user status (ONLINE, OFFLINE, AWAY, DND)
   */
  @Field(() => UserStatus, { defaultValue: UserStatus.OFFLINE })
  status: UserStatus;
}
