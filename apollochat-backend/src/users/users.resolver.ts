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

interface UserStatusChangedPayload {
  userStatusChanged: User;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  async findOne(@Args('_id') _id: string): Promise<User> {
    return this.usersService.findOne(_id);
  }

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

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<User> {
    return this.usersService.update(user._id, updateUserInput);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async removeUser(@CurrentUser() user: TokenPayload): Promise<User> {
    return this.usersService.remove(user._id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@CurrentUser() user: TokenPayload) {
    // Fetch the current user from the database to get the most up-to-date status
    return this.usersService.findOne(user._id);
  }

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
    // It's required for the GraphQL schema even though we don't use it directly in the method body
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ) {
    return this.pubSub.asyncIterableIterator(USER_STATUS_CHANGED);
  }
}
