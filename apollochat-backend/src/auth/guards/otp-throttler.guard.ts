import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerLimitDetail,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '../../common/guards/throttler-behind-proxy.guard';
import { Request } from 'express';

@Injectable()
export class OtpThrottlerGuard extends ThrottlerBehindProxyGuard {
  /**
   * Override the getTracker method to provide endpoint-specific rate limits
   */
  protected getTrackerOptions(context: ExecutionContext): ThrottlerOptions {
    const request = this.getRequestResponse(context).req;
    const path = request.path || '';

    // Set different limits based on the endpoint
    if (path.includes('/auth/send-otp')) {
      // Strict limit: 1 request per minute
      return {
        ttl: 60000, // 1 minute
        limit: 1,
      };
    } else if (path.includes('/auth/verify-otp')) {
      // Allow 5 verification attempts per minute
      return {
        ttl: 60000, // 1 minute
        limit: 5,
      };
    } else if (path.includes('/auth/check-email-verified')) {
      // More lenient: 10 status checks per minute
      return {
        ttl: 60000, // 1 minute
        limit: 10,
      };
    }

    // Default throttling options
    return {
      ttl: 60000,
      limit: 20,
    };
  }

  /**
   * Override the throwThrottlingException method to provide a custom error message for OTP endpoints
   */
  protected override async throwThrottlingException(
    context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = this.getRequestResponse(context).req;
    const path = request.path || '';

    // Custom error messages based on the endpoint
    if (path.includes('/auth/send-otp')) {
      throw new ThrottlerException(
        'Rate limit exceeded: Please wait 1 minute before requesting another OTP code.',
      );
    } else if (path.includes('/auth/verify-otp')) {
      throw new ThrottlerException(
        'Too many verification attempts: Please wait before trying again.',
      );
    } else if (path.includes('/auth/check-email-verified')) {
      throw new ThrottlerException(
        'Rate limit exceeded: Please wait before checking verification status again.',
      );
    } else {
      // Default throttling message
      throw new ThrottlerException('Too many requests');
    }
  }
}
