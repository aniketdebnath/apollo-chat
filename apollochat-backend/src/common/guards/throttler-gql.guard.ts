import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';

interface MockResponse {
  header: () => MockResponse;
  status: () => MockResponse;
  send: () => MockResponse;
  set: () => MockResponse;
}

@Injectable()
export class ThrottlerGqlGuard extends ThrottlerBehindProxyGuard {
  // Use protected instead of private to avoid conflict with parent class
  protected readonly gqlLogger = new Logger(ThrottlerGqlGuard.name);

  getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req: Request; res: Response }>();

      // Check if context contains valid req/res objects
      if (!ctx || !ctx.req) {
        // Create a mock response object with required methods
        const mockRes: MockResponse = {
          header: () => mockRes,
          status: () => mockRes,
          send: () => mockRes,
          set: () => mockRes,
        };

        return {
          req: {} as Request,
          res: mockRes as unknown as Response,
        };
      }

      // Ensure res has required methods
      if (!ctx.res || typeof ctx.res.header !== 'function') {
        const res = ctx.res || ({} as Record<string, unknown>);
        // Add missing methods to response object
        const mockRes: Record<string, unknown> = {
          ...res,
          header: function () {
            return mockRes;
          },
          status: function () {
            return mockRes;
          },
          send: function () {
            return mockRes;
          },
          set: function () {
            return mockRes;
          },
        };

        return { req: ctx.req, res: mockRes as unknown as Response };
      }

      return { req: ctx.req, res: ctx.res };
    } catch (error) {
      // Log the error and return mock objects
      this.gqlLogger.error(
        'Failed to extract request from GraphQL context',
        error,
      );

      // Create a mock response object with required methods
      const mockRes: MockResponse = {
        header: () => mockRes,
        status: () => mockRes,
        send: () => mockRes,
        set: () => mockRes,
      };

      return {
        req: {} as Request,
        res: mockRes as unknown as Response,
      };
    }
  }
}
