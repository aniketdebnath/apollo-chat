import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { Types } from 'mongoose';

@Schema({ versionKey: false })
export class RefreshToken extends AbstractEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  revoked: boolean;

  @Prop()
  revokedAt?: Date;

  @Prop()
  userAgent?: string;

  @Prop()
  ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
