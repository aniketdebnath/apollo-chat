/**
 * Migration: Create unique email index on users collection
 *
 * This migration ensures that email addresses are unique across all users,
 * preventing duplicate accounts with the same email address.
 */
import { Db } from 'mongodb';

module.exports = {
  /**
   * Migration implementation
   *
   * Creates a unique index on the 'email' field of the users collection.
   * This enforces uniqueness at the database level and improves query performance
   * for email-based lookups.
   *
   * @param db - MongoDB database instance
   */
  async up(db: Db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },
};
