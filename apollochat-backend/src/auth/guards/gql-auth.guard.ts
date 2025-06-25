/**
 * GraphQL Authentication Guard
 *
 * Protects GraphQL operations that require authentication.
 * Extends the JWT auth guard to work with GraphQL context.
 */
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * Guard that implements JWT authentication for GraphQL operations
 * Extracts the HTTP request from the GraphQL context to validate JWT tokens.
 */
export class GqlAuthGuard extends AuthGuard('jwt') {
  /**
   * Extracts the request object from the GraphQL context
   *
   * @param context - The execution context (GraphQL)
   * @returns The Express request object
   */
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: Request }>().req;
    return request;
  }
}
