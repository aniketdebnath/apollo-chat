import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
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

@Injectable()
export class UsersService {
  // Map to track active connections per user
  private activeConnections = new Map<string, number>();

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
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        const errorMessage = error.message;
        if (errorMessage.includes('E11000')) {
          throw new UnprocessableEntityException('Email already exits.');
        }
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
      throw new UnauthorizedException('Credentails are not valid');

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
    const updatedUser = await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { $set: { status } },
    );

    return this.toEntity(updatedUser);
  }

  /**
   * Track a new WebSocket connection for a user
   * @param userId - User ID
   * @returns True if this is the first connection for the user
   */
  async trackConnection(userId: string): Promise<boolean> {
    const count = this.activeConnections.get(userId) || 0;
    this.activeConnections.set(userId, count + 1);

    // If this is the first connection, update status to ONLINE
    if (count === 0) {
      // Get current user to check if they have a manually set status
      const user = await this.usersRepository.findOne({ _id: userId });
      // Only update to ONLINE if not already in AWAY or DND (manually set statuses)
      const currentStatus = user.status;
      if (currentStatus !== 'AWAY' && currentStatus !== 'DND') {
        await this.updateStatus(userId, UserStatus.ONLINE);
      }
      return true;
    }
    return false;
  }

  /**
   * Track a WebSocket disconnection for a user
   * @param userId - User ID
   * @returns True if this was the last connection for the user
   */
  async trackDisconnection(userId: string): Promise<boolean> {
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
    const user = {
      ...userDocument,
      // Convert status string to proper enum value
      status:
        (userDocument.status?.toUpperCase() as UserStatus) ||
        UserStatus.OFFLINE,
      imageUrl: this.s3Service.getObjectUrl(
        USERS_BUCKET,
        this.getUserImage(userDocument._id.toHexString()),
      ),
    };
    delete user.password;
    return user as User;
  }

  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }
}
