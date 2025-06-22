import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { TokenPayload } from '../../auth/interfaces/token-payload.interface';
import { GraphQLResolveInfo } from 'graphql';

interface UserWithEmail extends TokenPayload {
  email: string;
}

interface GqlContext {
  req: Request & { user?: UserWithEmail };
}

interface LoginBody {
  email?: string;
  password?: string;
}

@Injectable()
export class DemoUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DemoUserInterceptor.name);
  private readonly DEMO_EMAIL = 'demo@apollochat.com';
  private readonly WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
  private readonly READ_METHODS = ['GET'];
  private readonly ALLOWED_PATHS = ['/auth/login', '/auth/logout'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const contextType = context.getType<string>();

      // For REST requests
      if (contextType === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as UserWithEmail;
        const path = request.path;

        // Allow login and logout for demo user
        if (this.ALLOWED_PATHS.includes(path)) {
          // Special case for login - only allow demo user to login
          if (path === '/auth/login' && request.method === 'POST') {
            const body = request.body as LoginBody;
            // If this is a demo login attempt, allow it
            if (body && body.email === this.DEMO_EMAIL) {
              return next.handle();
            }
          } else {
            // Allow logout for everyone
            return next.handle();
          }
        }

        // Block write operations for demo user
        if (
          user?.email === this.DEMO_EMAIL &&
          this.WRITE_METHODS.includes(request.method)
        ) {
          this.logger.warn(
            `Demo user attempted write operation: ${request.method} ${path}`,
          );
          throw new ForbiddenException('Demo account is read-only');
        }
      }

      // For GraphQL requests
      else if (contextType === 'graphql') {
        const gqlContext = GqlExecutionContext.create(context);
        const ctx = gqlContext.getContext<GqlContext>();
        const user = ctx.req?.user;
        const info = gqlContext.getInfo<GraphQLResolveInfo>();

        // Block mutations for demo user
        if (
          user?.email === this.DEMO_EMAIL &&
          info.operation &&
          info.operation.operation === 'mutation'
        ) {
          const operationName = info.operation.name?.value || 'unknown';
          this.logger.warn(
            `Demo user attempted GraphQL mutation: ${operationName}`,
          );
          throw new ForbiddenException('Demo account is read-only');
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error in demo user interceptor', error);
    }

    return next.handle();
  }
}
