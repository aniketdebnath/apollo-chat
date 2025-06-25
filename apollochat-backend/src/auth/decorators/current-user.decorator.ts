/**
 * Current User Decorator
 *
 * Provides a convenient way to access the authenticated user in both HTTP and GraphQL contexts.
 * Extracts user information from the request context set by authentication guards.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

/**
 * Helper function to extract the current user from different execution contexts
 * Supports both HTTP and GraphQL contexts
 *
 * @param context - The execution context (HTTP or GraphQL)
 * @returns The authenticated user entity
 * @throws Error if the context type is not supported
 */
const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  } else if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext().req.user;
  }
  throw new Error(`Unhandled execution context type: ${context.getType()}`);
};

/**
 * Decorator that extracts the authenticated user from the request context
 * Can be used in both REST controllers and GraphQL resolvers
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
