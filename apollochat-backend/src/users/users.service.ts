// users.service.ts
// Business logic for user management: creation, profiles, status, and presence tracking
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
  Inject,
  forwardRef,
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
import { AuthService } from '../auth/auth.service';

/**
 * UsersService
 *
 * Provides user lifecycle management including creation, authentication,
 * profile updates, image uploads, presence tracking, and email-based search.
 * Supports both local and OAuth users, with secure password handling and real-time status updates.
 */
@Injectable()
export class UsersService {
  // Connection tracking for user presence system
  private activeConnections = new Map<string, number>();
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * Creates a new user with email verification
   *
   * Creates a user in the database with hashed password and sends an OTP
   * for email verification. The user starts with OFFLINE status.
   *
   * @param createUserInput - Data transfer object with user creation data
   * @returns Newly created user entity
   * @throws UnprocessableEntityException if email already exists
   */
  async create(createUserInput: CreateUserInput) {
    try {
      // Check for existing users with the same email
      const existingUser = await this.usersRepository.find({
        email: createUserInput.email,
      });
      if (existingUser && existingUser.length > 0) {
        throw new UnprocessableEntityException('Email already exists.');
      }

      // Send verification OTP
      await this.authService.generateAndSendOtp(createUserInput.email);

      // Create user with hashed password
      return this.toEntity(
        await this.usersRepository.create({
          ...createUserInput,
          password: await this.hashPassword(createUserInput.password),
          status: UserStatus.OFFLINE,
        }),
      );
    } catch (error) {
      // Handle MongoDB duplicate key errors
      if (
        error instanceof Error &&
        (error.message.includes('E11000') ||
          error.message.includes('duplicate key'))
      ) {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw error;
    }
  }

  /**
   * Hashes a password using bcrypt
   *
   * @param password - Plain text password to hash
   * @returns Promise resolving to hashed password string
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Retrieves all users from the database
   *
   * @returns Array of all user entities
   */
  async findAll() {
    return (await this.usersRepository.find({})).map((userDocument) =>
      this.toEntity(userDocument),
    );
  }

  /**
   * Finds a user by their ID
   *
   * @param _id - User ID to search for
   * @returns User entity if found, null otherwise
   */
  async findOne(_id: string) {
    return this.toEntity(await this.usersRepository.findOne({ _id }));
  }

  /**
   * Finds a user by their email address
   *
   * @param email - Email address to search for
   * @returns User entity if found, null otherwise
   */
  async findByEmail(email: string) {
    try {
      return this.toEntity(await this.usersRepository.findOne({ email }));
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Updates a user's profile information
   *
   * @param _id - User ID to update
   * @param updateUserInput - Data transfer object with fields to update
   * @returns Updated user entity
   */
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

  /**
   * Removes a user from the database
   *
   * @param _id - User ID to remove
   * @returns Removed user entity
   */
  async remove(_id: string) {
    return this.toEntity(await this.usersRepository.findOneAndDelete({ _id }));
  }

  /**
   * Verifies user credentials for authentication
   *
   * Validates the provided email and password against stored credentials
   * and checks if the email has been verified.
   *
   * @param email - User's email address
   * @param password - User's password to verify
   * @returns Authenticated user entity if credentials are valid
   * @throws UnauthorizedException if credentials are invalid or email is not verified
   */
  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Verify email before allowing login
    const isVerified = await this.authService.isEmailVerified(email);
    if (!isVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    return this.toEntity(user);
  }

  /**
   * Uploads a profile image for a user
   *
   * @param file - Image file buffer
   * @param userId - User ID to associate with the image
   */
  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({
      bucket: USERS_BUCKET,
      key: this.getUserImage(userId),
      file,
    });
  }

  /**
   * Updates a user's status
   *
   * Updates the user's status in the database and returns the updated user entity.
   * This method is used for manual status changes by the user (AWAY, DND).
   * Automatic status changes (ONLINE, OFFLINE) are handled by the connection tracking methods.
   *
   * @param userId - User ID to update
   * @param status - New status to set (ONLINE, AWAY, DND, OFFLINE)
   * @returns Updated user entity with the new status
   * @throws Error if the update operation fails
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
   * Updates a user's password with proper hashing
   *
   * @param userId - User ID to update
   * @param newPassword - New password (will be hashed)
   * @returns Boolean indicating success
   */
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await this.hashPassword(newPassword);

      await this.usersRepository.findOneAndUpdate(
        { _id: userId },
        { $set: { password: hashedPassword } },
      );

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update password for user ${userId}: ${errorMessage}`,
      );
      return false;
    }
  }

  /**
   * Tracks a new WebSocket connection for a user
   *
   * Increments the connection count for a user and updates their status to ONLINE
   * if this is their first connection and they don't have a manually set status.
   * This is used for real-time presence tracking.
   *
   * @param userId - User ID to track connection for
   * @returns True if this is the first connection for the user
   */
  async trackConnection(userId: string): Promise<boolean> {
    try {
      const count = this.activeConnections.get(userId) || 0;
      this.activeConnections.set(userId, count + 1);

      // Only update status for first connection
      if (count === 0) {
        // Preserve manually set statuses (AWAY/DND)
        const user = await this.usersRepository.findOne({ _id: userId });
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
      // Ensure connection count is still incremented even if status update fails
      const count = this.activeConnections.get(userId) || 0;
      this.activeConnections.set(userId, count + 1);
      return false;
    }
  }

  /**
   * Tracks a WebSocket disconnection for a user
   *
   * Decrements the connection count for a user and updates their status to OFFLINE
   * if this was their last connection.
   *
   * @param userId - User ID to track disconnection for
   * @returns True if this was the last connection for the user
   */
  async trackDisconnection(userId: string): Promise<boolean> {
    try {
      const count = this.activeConnections.get(userId) || 1;
      if (count <= 1) {
        // Last connection - set user offline
        this.activeConnections.delete(userId);
        await this.updateStatus(userId, UserStatus.OFFLINE);
        return true;
      } else {
        // User still has other connections
        this.activeConnections.set(userId, count - 1);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Failed to track disconnection for user ${userId}:`,
        error,
      );
      // Ensure connection count is still decremented even if status update fails
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
   * Searches for users by partial email match
   *
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
    // Case-insensitive regex search
    const filter: FilterQuery<UserDocument> = {
      email: { $regex: searchTerm, $options: 'i' },
    };

    // Exclude current user from results
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    const users = await this.usersRepository.find(filter);
    const limitedUsers = users.slice(0, limit);

    return limitedUsers.map((userDocument) => this.toEntity(userDocument));
  }

  /**
   * Converts a user document from the database to a user entity
   *
   * Handles status conversion, image URL generation, and password removal
   *
   * @param userDocument - User document from MongoDB
   * @returns User entity with sensitive fields removed
   */
  toEntity(userDocument: UserDocument): User {
    if (!userDocument) {
      return null;
    }

    try {
      // Convert document to entity with proper status enum
      const user = {
        ...userDocument,
        status:
          (userDocument.status?.toUpperCase() as UserStatus) ||
          UserStatus.OFFLINE,
      } as unknown as User;

      // Generate S3 image URL if available
      try {
        user.imageUrl = this.s3Service.getObjectUrl(
          USERS_BUCKET,
          this.getUserImage(userDocument._id.toHexString()),
        );
      } catch {
        // Image URL generation failed - leave as undefined
      }

      // Remove password from returned entity
      const userWithPassword = user as User & { password?: string };
      delete userWithPassword.password;
      return user;
    } catch (error) {
      this.logger.error(
        `Error converting user document to entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Fallback with minimal safe data
      const safeUser = {
        ...userDocument,
        status: UserStatus.OFFLINE,
      } as unknown as User & { password?: string };

      delete safeUser.password;
      return safeUser;
    }
  }

  /**
   * Generates the S3 key for a user's profile image
   *
   * @param userId - User ID
   * @returns S3 object key for the user's profile image
   */
  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }

  /**
   * Finds or creates a user based on Google OAuth profile data
   *
   * Handles various cases: existing user with Google ID, existing user by email,
   * or new user creation. Also manages profile image import from Google.
   *
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
      // Try to find by Google ID first
      let user = await this.usersRepository
        .findOne({ googleId: googleUserData.googleId })
        .catch(() => null);

      // If not found, try by email
      if (!user) {
        try {
          user = await this.usersRepository.findOne({
            email: googleUserData.email,
          });
        } catch {
          user = null;
        }
      }

      // Create new user if not found
      if (!user) {
        // Double check for existing user to prevent duplicates
        const existingUserByEmail = await this.usersRepository.find({
          email: googleUserData.email,
        });

        if (existingUserByEmail && existingUserByEmail.length > 0) {
          // Update existing user with Google ID
          user = await this.usersRepository.findOneAndUpdate(
            { email: googleUserData.email },
            { $set: { googleId: googleUserData.googleId } },
          );
          return this.toEntity(user);
        }

        // Generate secure random password
        const randomPassword = this.generateSecureRandomPassword();

        try {
          // Create new user with Google data
          user = await this.usersRepository.create({
            googleId: googleUserData.googleId,
            email: googleUserData.email,
            username: googleUserData.username,
            password: await this.hashPassword(randomPassword),
            status: UserStatus.OFFLINE,
          });
        } catch (createError) {
          // Handle race condition where user was created in parallel
          if (
            createError instanceof Error &&
            (createError.message.includes('E11000') ||
              createError.message.includes('duplicate key'))
          ) {
            user = await this.usersRepository.findOne({
              email: googleUserData.email,
            });

            // Update with Google ID if needed
            if (user && !(user as UserDocument).googleId) {
              user = await this.usersRepository.findOneAndUpdate(
                { _id: (user as UserDocument)._id },
                { $set: { googleId: googleUserData.googleId } },
              );
            }
          } else {
            throw createError;
          }
        }

        // Import profile image if available
        if (user && googleUserData.imageUrl) {
          await this.importProfileImageFromUrl(
            googleUserData.imageUrl,
            (user as UserDocument)._id.toString(),
          );
        }
      } else if (!(user as UserDocument).googleId) {
        // Update existing user with Google ID
        user = await this.usersRepository.findOneAndUpdate(
          { _id: (user as UserDocument)._id },
          { $set: { googleId: googleUserData.googleId } },
        );
      }

      return this.toEntity(user);
    } catch (error) {
      this.logger.error(`Failed to find or create Google user: ${error}`);
      throw error;
    }
  }

  /**
   * Generates a secure random password for OAuth users
   *
   * @returns Random secure password string
   */
  private generateSecureRandomPassword(): string {
    return (
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).toUpperCase().slice(-10)
    );
  }

  /**
   * Imports a profile image from a URL
   *
   * @param imageUrl - URL of the image to download
   * @param userId - User ID to associate with the image
   */
  private async importProfileImageFromUrl(
    imageUrl: string,
    userId: string,
  ): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await this.uploadImage(buffer, userId);
    } catch (error) {
      this.logger.error(`Failed to import profile image: ${error}`);
    }
  }
}
