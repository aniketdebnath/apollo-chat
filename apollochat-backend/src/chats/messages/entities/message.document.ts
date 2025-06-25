// message.document.ts

import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * MessageDocument
 *
 * MongoDB document schema for chat messages.
 * Embedded within Chat documents as a subdocument array.
 * Stores message content, creation timestamp, and author reference.
 */
@Schema()
export class MessageDocument extends AbstractEntity {
  @Prop()
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  userId: Types.ObjectId;
}
