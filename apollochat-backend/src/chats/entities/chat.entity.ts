import { ObjectType, Field } from '@nestjs/graphql';

import { AbstractEntity } from '../../common/database/abstract.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Chat extends AbstractEntity {
  @Field({ nullable: true })
  name: string;
  @Field(() => Message, { nullable: true })
  latestMessage?: Message;
  @Field(() => String)
  type: string;
  @Field(() => [User])
  members: User[];
  @Field(() => User)
  creator: User;
  @Field(() => Boolean, { defaultValue: false })
  isPinned: boolean;
}
