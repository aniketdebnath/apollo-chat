import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity';
import { MessageDocument } from '../messages/entities/message.document';
import { Types } from 'mongoose';

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
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);

ChatSchema.index({ members: 1, type: 1 });
