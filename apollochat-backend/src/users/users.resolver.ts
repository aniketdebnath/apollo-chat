// users.resolver.ts
// GraphQL resolver for user management: queries, mutations, and subscriptions

import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { UpdateStatusInput } from './dto/update-status.input';
import { PUB_SUB } from '../common/constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { USER_STATUS_CHANGED } from './constants/pubsub-triggers';

/**
 * Payload type for user status change subscription events
 */
interface UserStatusChangedPayload {
  userStatusChanged: User;
}

/**
 * UsersResolver
 *
 * Handles user creation, updates, status changes, and real-time status subscriptions.
 */
@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  /**
   * Creates a new user
   *
   * @param createUserInput - User creation data
   * @returns Newly created user entity
   */
  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  /**
   * Retrieves all users
   *
   * @returns Array of all user entities
   */
  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Finds a user by ID
   *
   * @param _id - User ID to find
   * @returns User entity if found
   */
  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  async findOne(@Args('_id') _id: string): Promise<User> {
    return this.usersService.findOne(_id);
  }

  /**
   * Searches for users by email
   *
   * @param searchTerm - Email search term (partial match)
   * @param limit - Maximum number of results to return
   * @param user - Current authenticated user
   * @returns Array of matching user entities
   */
  @Query(() => [User], { name: 'searchUsers' })
  @UseGuards(GqlAuthGuard)
  async searchUsers(
    @Args('searchTerm') searchTerm: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
    @CurrentUser() user: TokenPayload,
  ): Promise<User[]> {
    return this.usersService.searchByEmail(searchTerm, user._id, limit);
  }

  /**
   * Updates a user's profile information
   *
   * @param updateUserInput - User update data
   * @param user - Current authenticated user
   * @returns Updated user entity
   */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<User> {
    return this.usersService.update(user._id, updateUserInput);
  }

  /**
   * Removes the current user's account
   *
   * @param user - Current authenticated user
   * @returns Removed user entity
   */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async removeUser(@CurrentUser() user: TokenPayload): Promise<User> {
    return this.usersService.remove(user._id);
  }

  /**
   * Gets the current authenticated user's profile
   *
   * @param user - Current authenticated user
   * @returns Current user entity with up-to-date information
   */
  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@CurrentUser() user: TokenPayload) {
    // Fetch the current user from the database to get the most up-to-date status
    return this.usersService.findOne(user._id);
  }

  /**
   * Updates a user's status and broadcasts the change
   *
   * @param updateStatusInput - New status information
   * @param user - Current authenticated user
   * @returns Updated user entity with new status
   */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUserStatus(
    @Args('updateStatusInput') updateStatusInput: UpdateStatusInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<User> {
    const updatedUser = await this.usersService.updateStatus(
      user._id,
      updateStatusInput.status,
    );

    // Publish the status change
    this.pubSub.publish(USER_STATUS_CHANGED, {
      userStatusChanged: updatedUser,
    });

    return updatedUser;
  }

  /**
   * Subscribes to user status change events
   *
   * @param userIds - Array of user IDs to monitor for status changes
   * @returns AsyncIterator for status change events
   */
  @Subscription(() => User, {
    filter: (
      payload: UserStatusChangedPayload,
      variables: { userIds: string[] },
    ) => {
      return variables.userIds.includes(
        payload.userStatusChanged._id.toString(),
      );
    },
  })
  userStatusChanged(
    // The userIds parameter is used in the filter function above
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ) {
    return this.pubSub.asyncIterableIterator(USER_STATUS_CHANGED);
  }
}
