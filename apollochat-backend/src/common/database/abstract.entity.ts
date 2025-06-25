/**
 * GraphQL and MongoDB schema decorators
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/**
 * AbstractEntity
 *
 * Base class for all database entities in the application.
 * Provides common _id field with proper GraphQL and MongoDB typing.
 * All entity classes should extend this class.
 */
@Schema()
@ObjectType({ isAbstract: true })
export class AbstractEntity {
  /**
   * MongoDB ObjectId primary key
   * Exposed as ID scalar type in GraphQL
   */
  @Prop({ type: SchemaTypes.ObjectId })
  @Field(() => ID)
  _id: Types.ObjectId;
}
