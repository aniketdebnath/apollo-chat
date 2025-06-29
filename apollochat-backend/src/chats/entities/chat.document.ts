// chat.document.ts
// MongoDB schema definition for chat documents

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { MessageDocument } from '../messages/entities/message.document';
import { Types } from 'mongoose';

/**
 * ChatDocument
 *
 * MongoDB document schema for chat conversations.
 * Stores chat metadata, embedded messages array, and member references.
 * Includes indexing for efficient member and type-based queries.
 */
@Schema()
export class ChatDocument extends AbstractEntity {
  @Prop()
  creatorId: string;

  @Prop()
  name: string;

  @Prop({
    type: String,
    enum: ['private', 'public', 'open'],
    default: 'private',
  })
  type: string;

  @Prop([MessageDocument])
  messages: MessageDocument[];

  @Prop([{ type: Types.ObjectId, ref: 'UserDocument' }])
  members: Types.ObjectId[];

  @Prop({ type: Map, of: Boolean, default: {} })
  pinnedBy: Map<string, boolean>;

  @Prop({ type: Object, default: {} })
  bannedUsers: Record<string, { until: Date | null; reason: string }>;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);

// Index for efficient filtering by members and chat type
ChatSchema.index({ members: 1, type: 1 });
