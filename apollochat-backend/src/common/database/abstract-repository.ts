/**
 * Mongoose-specific imports for database operations
 */
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractEntity } from './abstract.entity';
import { Logger, NotFoundException } from '@nestjs/common';

/**
 * AbstractRepository
 *
 * Generic repository base class that provides common CRUD operations
 * for MongoDB collections. All entity-specific repositories extend this class.
 *
 * @template T - Entity type extending AbstractEntity
 */
export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;
  constructor(public readonly model: Model<T>) {}

  /**
   * Creates a new document in the collection
   *
   * Automatically generates a MongoDB ObjectId for the new document
   * and returns the created entity after saving.
   *
   * @param document - Document data without _id field
   * @returns Promise resolving to the created entity
   */
  async create(document: Omit<T, '_id'>): Promise<T> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createDocument.save()).toJSON() as unknown as T;
  }

  /**
   * Finds a single document matching the filter query
   *
   * Uses Mongoose's lean() for better performance by returning
   * plain JavaScript objects instead of Mongoose documents.
   *
   * @param filterQuery - MongoDB filter criteria
   * @returns Promise resolving to the found entity
   * @throws NotFoundException if no document matches the query
   */
  async findOne(filterQuery: FilterQuery<T>): Promise<T> {
    const document = await this.model.findOne(filterQuery).lean<T>();

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  /**
   * Finds a document and updates it in a single operation
   *
   * Uses the {new: true} option to return the updated document
   * rather than the original document before the update.
   *
   * @param filterQuery - MongoDB filter criteria
   * @param update - Update operations to apply
   * @returns Promise resolving to the updated entity
   * @throws NotFoundException if no document matches the query
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<T>();
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  /**
   * Finds all documents matching the filter query
   *
   * Uses lean() for better performance when retrieving multiple documents.
   *
   * @param filterQuery - MongoDB filter criteria
   * @returns Promise resolving to an array of matching entities
   */
  async find(filterQuery: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filterQuery).lean<T[]>();
  }

  /**
   * Finds a document and deletes it in a single operation
   *
   * Returns the deleted document for potential further processing.
   *
   * @param filterQuery - MongoDB filter criteria
   * @returns Promise resolving to the deleted entity
   * @throws NotFoundException if no document matches the query
   */
  async findOneAndDelete(filterQuery: FilterQuery<T>): Promise<T> {
    const document = await this.model.findOneAndDelete(filterQuery).lean<T>();
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }
}
