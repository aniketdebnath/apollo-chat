import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserInput: CreateUserInput) {
    try {
      return await this.usersRepository.create({
        ...createUserInput,
        password: await this.hashPassword(createUserInput.password),
      });
    } catch (error) {
      if (error.message.includes('E11000')) {
        throw new UnprocessableEntityException('Email already exits.');
      }
      throw error;
    }
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async findAll() {
    return this.usersRepository.find({});
  }

  async findOne(_id: string) {
    return this.usersRepository.findOne({ _id });
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

    return this.usersRepository.findOneAndUpdate({ _id }, { $set: updateData });
  }

  async remove(_id: string) {
    return this.usersRepository.findOneAndDelete({ _id });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid)
      throw new UnauthorizedException('Credentails are not valid');

    return user;
  }
}
