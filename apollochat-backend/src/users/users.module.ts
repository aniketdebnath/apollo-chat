// users.module.ts
// Module for user management: creation, profile handling, and status tracking
import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepository } from './users.repository';
import { DatabaseModule } from '../common/database/database.module';
import { User } from './entities/user.entity';
import { UserSchema } from './entities/user.document';
import { UsersController } from './users.controller';
import { S3Module } from '../common/s3/s3.module';
import { AuthModule } from '../auth/auth.module';

/**
 * UsersModule
 *
 * Provides user-related features including account creation, authentication support,
 * image uploads via S3, and GraphQL/REST API integration. Registers the User schema.
 */
@Module({
  imports: [
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersResolver, UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
