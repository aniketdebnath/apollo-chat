import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { MessageDocument } from '../messages/entities/message.document';

@Schema()
export class ChatDocument extends AbstractEntity {
  @Prop()
  userId: string;

  @Prop()
  name: string;

  @Prop([MessageDocument])
  messages: MessageDocument[];
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);
