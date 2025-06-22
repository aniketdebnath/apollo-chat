import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';

@Schema({ versionKey: false })
export class OtpVerification extends AbstractEntity {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  verified: boolean;
}

export const OtpVerificationSchema =
  SchemaFactory.createForClass(OtpVerification);
