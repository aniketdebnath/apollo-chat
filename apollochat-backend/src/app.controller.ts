import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Get('test-rate-limit')
  testRateLimit(): { message: string; timestamp: number } {
    return {
      message: 'This endpoint is rate limited to 100 requests per minute',
      timestamp: Date.now(),
    };
  }
}
