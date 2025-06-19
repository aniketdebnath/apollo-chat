import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityService } from './security.service';
import { SecurityInterceptor } from './security.interceptor';
import { ThrottlerBehindProxyGuard } from '../guards/throttler-behind-proxy.guard';

@Module({
  imports: [
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds in milliseconds
        limit: 100, // 100 requests per TTL
      },
    ]),

    /* eslint-enable @typescript-eslint/no-unsafe-call */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    SecurityService,
    SecurityInterceptor,
  ],
  exports: [SecurityService, SecurityInterceptor],
})
export class SecurityModule {}
