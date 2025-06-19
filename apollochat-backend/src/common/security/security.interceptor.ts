import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';
import { Request } from 'express';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);

  constructor(private readonly securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      // Skip for GraphQL requests or if request is undefined
      if (!request) {
        return next.handle();
      }

      // Check for suspicious requests if user agent and path exist
      const userAgent = request.headers?.['user-agent'];
      const path = request.path;

      if (
        userAgent &&
        path &&
        this.securityService.isSuspiciousRequest(userAgent, path)
      ) {
        throw new BadRequestException('Invalid request');
      }

      // Sanitize input for common fields
      if (request.body) {
        const body = request.body as Record<string, unknown>;
        const fieldsToSanitize = [
          'name',
          'title',
          'description',
          'message',
          'content',
        ];

        for (const field of fieldsToSanitize) {
          if (typeof body[field] === 'string') {
            body[field] = this.securityService.sanitizeInput(body[field]);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in security interceptor', error);
      // Don't block the request if there's an error in the interceptor
    }

    return next.handle();
  }
}
