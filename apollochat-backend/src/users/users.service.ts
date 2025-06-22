import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../common/s3/s3.service';
import { USERS_BUCKET, USERS_IMAGE_FILE_EXTENSION } from './users.constants';
import { UserDocument } from './entities/user.document';
import { User } from './entities/user.entity';
import { FilterQuery } from 'mongoose';
import { UserStatus } from './constants/user-status.enum';
import fetch from 'node-fetch';

@Injectable()
export class UsersService {
  // Map to track active connections per user
  private activeConnections = new Map<string, number>();
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(createUserInput: CreateUserInput) {
    try {
      return this.toEntity(
        await this.usersRepository.create({
          ...createUserInput,
          password: await this.hashPassword(createUserInput.password),
          status: UserStatus.OFFLINE,
        }),
      );
    } catch (error) {
      // Check if error is a MongoDB duplicate key error
      if (error instanceof Error && error.message.includes('E11000')) {
        throw new UnprocessableEntityException('Email already exits.');
      }
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async findAll() {
    return (await this.usersRepository.find({})).map((userDocument) =>
      this.toEntity(userDocument),
    );
  }

  async findOne(_id: string) {
    return this.toEntity(await this.usersRepository.findOne({ _id }));
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    return this.toEntity(
      await this.usersRepository.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...updateUserInput,
          },
        },
      ),
    );
  }

  async remove(_id: string) {
    return this.toEntity(await this.usersRepository.findOneAndDelete({ _id }));
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid)
      throw new UnauthorizedException('Credentials are not valid');

    return this.toEntity(user);
  }

  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({
      bucket: USERS_BUCKET,
      key: this.getUserImage(userId),
      file,
    });
  }

  /**
   * Update a user's status
   * @param userId - User ID
   * @param status - New status
   * @returns Updated user entity
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    try {
      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: userId },
        { $set: { status } },
      );

      return this.toEntity(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Track a new WebSocket connection for a user
   * @param userId - User ID
   * @returns True if this is the first connection for the user
   */
  async trackConnection(userId: string): Promise<boolean> {
    try {
      const count = this.activeConnections.get(userId) || 0;
      this.activeConnections.set(userId, count + 1);

      // If this is the first connection, update status to ONLINE
      if (count === 0) {
        // Get current user to check if they have a manually set status
        const user = await this.usersRepository.findOne({ _id: userId });
        // Only update to ONLINE if not already in AWAY or DND (manually set statuses)
        const currentStatus = user.status?.toUpperCase();
        if (
          currentStatus !== UserStatus.AWAY.toString() &&
          currentStatus !== UserStatus.DND.toString()
        ) {
          await this.updateStatus(userId, UserStatus.ONLINE);
        }
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to track connection for user ${userId}:`,
        error,
      );
      // Still increment the connection count even if status update fails
      const count = this.activeConnections.get(userId) || 0;
      this.activeConnections.set(userId, count + 1);
      return false;
    }
  }

  /**
   * Track a WebSocket disconnection for a user
   * @param userId - User ID
   * @returns True if this was the last connection for the user
   */
  async trackDisconnection(userId: string): Promise<boolean> {
    try {
      const count = this.activeConnections.get(userId) || 1;
      if (count <= 1) {
        this.activeConnections.delete(userId);
        // Update status to OFFLINE only if this was the last connection
        await this.updateStatus(userId, UserStatus.OFFLINE);
        return true;
      } else {
        this.activeConnections.set(userId, count - 1);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Failed to track disconnection for user ${userId}:`,
        error,
      );
      // Still decrement the connection count even if status update fails
      const count = this.activeConnections.get(userId) || 1;
      if (count <= 1) {
        this.activeConnections.delete(userId);
        return true;
      } else {
        this.activeConnections.set(userId, count - 1);
        return false;
      }
    }
  }

  /**
   * Search users by email
   * @param searchTerm - Email search term (partial match)
   * @param currentUserId - ID of the current user (to exclude from results)
   * @param limit - Maximum number of results to return
   * @returns Array of User entities matching the search criteria
   */
  async searchByEmail(
    searchTerm: string,
    currentUserId?: string,
    limit = 10,
  ): Promise<User[]> {
    // Create a filter that matches email with case-insensitive regex
    const filter: FilterQuery<UserDocument> = {
      email: { $regex: searchTerm, $options: 'i' },
    };

    // Exclude the current user from search results if provided
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    // Find users matching the filter
    const users = await this.usersRepository.find(filter);

    // Apply limit to results (take the first 'limit' items)
    const limitedUsers = users.slice(0, limit);

    // Convert to User entities and return
    return limitedUsers.map((userDocument) => this.toEntity(userDocument));
  }

  toEntity(userDocument: UserDocument): User {
    if (!userDocument) {
      return null;
    }

    try {
      // Create a user object with required fields
      const user: any = {
        ...userDocument,
        // Convert status string to proper enum value
        status:
          (userDocument.status?.toUpperCase() as UserStatus) ||
          UserStatus.OFFLINE,
      };

      // Try to get the image URL, but don't fail if it's not available
      try {
        user.imageUrl = this.s3Service.getObjectUrl(
          USERS_BUCKET,
          this.getUserImage(userDocument._id.toHexString()),
        );
      } catch (_) {
        // Leave imageUrl as undefined/null
      }

      delete user.password;
      return user as unknown as User;
    } catch (error) {
      this.logger.error(
        `Error converting user document to entity: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Return user with default values for required fields
      const safeUser: any = {
        ...userDocument,
        status: UserStatus.OFFLINE,
      };

      delete safeUser.password;
      return safeUser as unknown as User;
    }
  }

  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }

  /**
   * Find or create a user based on Google OAuth profile data
   * @param googleUserData - User data from Google OAuth
   * @returns User entity
   */
  async findOrCreateGoogleUser(googleUserData: {
    googleId: string;
    email: string;
    username: string;
    imageUrl?: string;
  }): Promise<User> {
    try {
      // First try to find user by Google ID
      let user = await this.usersRepository
        .findOne({ googleId: googleUserData.googleId })
        .catch(() => null);

      // If not found, try to find by email
      if (!user) {
        try {
          user = await this.usersRepository.findOne({
            email: googleUserData.email,
          });
        } catch (error) {
          // User not found by email either
          user = null;
        }
      }

      // If still not found, create a new user
      if (!user) {
        // Generate a random secure password for OAuth users
        const randomPassword =
          Math.random().toString(36).slice(-10) +
          Math.random().toString(36).slice(-10) +
          Math.random().toString(36).toUpperCase().slice(-10);

        user = await this.usersRepository.create({
          googleId: googleUserData.googleId,
          email: googleUserData.email,
          username: googleUserData.username,
          password: await this.hashPassword(randomPassword),
          status: UserStatus.OFFLINE,
        });

        // If image URL is provided, try to download and upload it
        if (googleUserData.imageUrl) {
          try {
            const response = await fetch(googleUserData.imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await this.uploadImage(buffer, user._id.toString());
          } catch (error) {
            this.logger.error(
              `Failed to download and upload Google profile image: ${error}`,
            );
          }
        }
      } else if (!user.googleId) {
        // If user exists but doesn't have googleId, update it
        user = await this.usersRepository.findOneAndUpdate(
          { _id: user._id },
          { $set: { googleId: googleUserData.googleId } },
        );
      }

      return this.toEntity(user);
    } catch (error) {
      this.logger.error(`Failed to find or create Google user: ${error}`);
      throw error;
    }
  }
}
