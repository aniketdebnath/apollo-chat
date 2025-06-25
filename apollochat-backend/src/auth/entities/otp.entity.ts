/**
 * OTP Verification Entity for MongoDB
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';

/**
 * Represents a one-time password issued for email verification or password reset.
 * OTPs are time-limited and can only be used once.
 */
@Schema({ versionKey: false })
export class OtpVerification extends AbstractEntity {
  /**
   * Email address associated with this OTP
   */
  @Prop({ required: true })
  email: string;

  /**
   * The OTP code (typically a 6-digit number)
   */
  @Prop({ required: true })
  otp: string;

  /**
   * Expiration date for the OTP (typically 15 minutes after creation)
   */
  @Prop({ required: true })
  expiresAt: Date;

  /**
   * Whether this OTP has been verified successfully
   */
  @Prop({ default: false })
  verified: boolean;
}

export const OtpVerificationSchema =
  SchemaFactory.createForClass(OtpVerification);
