import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

interface GqlContext {
  req?: Request;
  res?: Response;
  [key: string]: unknown;
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ThrottlerBehindProxyGuard.name);

  protected getTracker(req: Request): Promise<string> {
    return new Promise<string>((resolve) => {
      // Check if req and req.headers exist
      if (!req || !req.headers) {
        resolve('unknown');
        return;
      }

      // CloudFront and other CDNs/proxies add the client IP to X-Forwarded-For
      // The format is typically: client, proxy1, proxy2, etc.

      // Get IP from X-Forwarded-For header if it exists
      if (req.headers['x-forwarded-for']) {
        const forwardedIps = Array.isArray(req.headers['x-forwarded-for'])
          ? req.headers['x-forwarded-for'][0]
          : req.headers['x-forwarded-for'];

        // Get the first IP in the list which is the client IP
        const clientIp = forwardedIps.split(',')[0].trim();
        resolve(clientIp);
        return;
      }

      // Fallback to req.ips (Express) or standard req.ip
      const tracker = req.ips?.length > 0 ? req.ips[0] : req.ip || 'unknown';
      resolve(tracker);
    });
  }

  // Override to handle both HTTP and GraphQL contexts
  getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    if (context.getType() === 'http') {
      return {
        req: context.switchToHttp().getRequest<Request>(),
        res: context.switchToHttp().getResponse<Response>(),
      };
    }

    // Handle GraphQL context
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<GqlContext>();

      if (ctx?.req) {
        const mockRes =
          ctx.res ||
          ({
            header: () => mockRes,
            status: () => mockRes,
            send: () => mockRes,
          } as unknown as Response);

        return {
          req: ctx.req,
          res: mockRes,
        };
      }
    } catch (_) {
      // If we can't get the GraphQL context, log and continue with default behavior
      this.logger.debug(
        'Could not extract GraphQL context, using default behavior',
      );
    }

    // Create empty objects with minimal functionality for default case
    const emptyReq = {} as Request;
    const emptyRes = {
      header: () => emptyRes,
      status: () => emptyRes,
      send: () => emptyRes,
    } as unknown as Response;

    return { req: emptyReq, res: emptyRes };
  }
}
