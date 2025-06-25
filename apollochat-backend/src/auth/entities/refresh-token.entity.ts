/**
 * Refresh Token Entity for MongoDB
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { Types } from 'mongoose';

/**
 * Represents a refresh token issued to a user during authentication.
 * Used for generating new access tokens without requiring re-authentication.
 */
@Schema({ versionKey: false })
export class RefreshToken extends AbstractEntity {
  /**
   * Reference to the user who owns this token
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  /**
   * The token value (cryptographically secure random string)
   */
  @Prop({ required: true })
  token: string;

  /**
   * Expiration date for the token
   */
  @Prop({ required: true })
  expiresAt: Date;

  /**
   * Whether this token has been revoked (e.g., on logout)
   */
  @Prop({ default: false })
  revoked: boolean;

  /**
   * When the token was revoked (if applicable)
   */
  @Prop()
  revokedAt?: Date;

  /**
   * User agent string from the client that requested this token
   * Used for identifying the device/browser
   */
  @Prop()
  userAgent?: string;

  /**
   * IP address of the client that requested this token
   * Used for security monitoring
   */
  @Prop()
  ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
