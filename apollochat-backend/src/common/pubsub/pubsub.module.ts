import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from '../constants/injection-tokens';
import { PubSub } from 'graphql-subscriptions';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';
import { reviver } from './reviver';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'production') {
          const options: RedisOptions = {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
            retryStrategy: (times) => Math.min(times * 50, 2000),
          };

          return new RedisPubSub({
            publisher: new Redis(options),
            subscriber: new Redis(options),
            reviver,
          });
        }
        return new PubSub();
      },
      inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
