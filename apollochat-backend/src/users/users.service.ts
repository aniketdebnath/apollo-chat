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

@Injectable()
export class UsersService {
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
        }),
      );
    } catch (error: any) {
      if (error.message?.includes('E11000')) {
        throw new UnprocessableEntityException('Email already exits.');
      }
      throw error;
    }
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
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
    // Create a copy of the input data
    const updateData = { ...updateUserInput };

    // Check if password exists and is not undefined
    if (updateData.password !== undefined) {
      updateData.password = await this.hashPassword(updateData.password);
    } else {
      // Remove password property if undefined to avoid overwriting with null
      delete updateData.password;
    }

    return this.toEntity(
      await this.usersRepository.findOneAndUpdate(
        { _id },
        { $set: updateData },
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
      imageUrl: this.s3Service.getObjectUrl(
        USERS_BUCKET,
        this.getUserImage(userDocument._id.toHexString()),
      ),
    };
    delete user.password;
    return user;
  }

  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }
}
