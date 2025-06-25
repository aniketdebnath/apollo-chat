// user.document.ts
// MongoDB schema definition for User documents (includes sensitive fields)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { UserStatus } from '../constants/user-status.enum';

/**
 * UserDocument
 *
 * Defines the MongoDB schema for user persistence.
 * Includes sensitive fields like password, status, and email verification.
 */
@Schema({ versionKey: false })
export class UserDocument extends AbstractEntity {
  /**
   * User's email address (unique identifier)
   */
  @Prop()
  email: string;

  /**
   * User's display name
   */
  @Prop()
  username: string;

  /**
   * Hashed password (only for non-OAuth users)
   */
  @Prop()
  password?: string;

  /**
   * Google OAuth ID (only for Google-authenticated users)
   */
  @Prop()
  googleId?: string;

  /**
   * Current user status stored as a string
   * Converted to UserStatus enum when transformed to entity
   */
  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.OFFLINE,
  })
  status: string;
}

/**
 * Mongoose schema generated from the UserDocument class
 */
export const UserSchema = SchemaFactory.createForClass(UserDocument);
