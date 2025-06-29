import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class BannedUser {
  @Field(() => User)
  user: User;

  @Field(() => Date, { nullable: true })
  until: Date | null;

  @Field()
  reason: string;
}
