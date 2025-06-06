import { Field, ObjectType } from '@nestjs/graphql';

import { AbstractEntity } from 'src/common/database/abstract.entity';

@ObjectType()
export class User extends AbstractEntity {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  imageUrl: string;
}
