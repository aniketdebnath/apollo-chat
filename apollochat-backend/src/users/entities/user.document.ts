import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { UserStatus } from '../constants/user-status.enum';

@Schema({ versionKey: false })
export class UserDocument extends AbstractEntity {
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.OFFLINE,
  })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
