import { Module, UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './common/database/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';
import { Logger } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { PubSubModule } from './common/pubsub/pubsub.module';
import { AuthService } from './auth/auth.service';
import { S3Module } from './common/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (authService: AuthService) => ({
        autoSchemaFile: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              try {
                // We're using 'any' type here because the actual context structure
                // comes from graphql-ws and we know its shape at runtime
                const extra = context.extra || {};
                const request = extra.request;

                if (!request) {
                  throw new Error(
                    'No request object found in connection context',
                  );
                }

                const user = authService.verifyWs(request);
                // Assign to the context object
                context.user = user;
              } catch (error) {
                new Logger().error(error);
                throw new UnauthorizedException();
              }
            },
          },
        },
      }),
      imports: [AuthModule],
      inject: [AuthService],
    }),
    DatabaseModule,
    UsersModule,
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ChatsModule,
    PubSubModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
