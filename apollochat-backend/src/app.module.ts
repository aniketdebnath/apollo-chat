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
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (authService: AuthService, usersService: UsersService) => ({
        autoSchemaFile: true,
        path: '/api/graphql',
        subscriptions: {
          'graphql-ws': {
            path: '/api/graphql',
            onConnect: async (context: any) => {
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

                // Track the connection and update status if it's the first connection
                // The trackConnection method now handles status updates internally
                await usersService.trackConnection(user._id);
              } catch (error) {
                new Logger().error(error);
                throw new UnauthorizedException();
              }
            },
            onDisconnect: async (context: any) => {
              try {
                const user = context.user;
                if (user && user._id) {
                  // Track the disconnection and update status if it's the last connection
                  // The trackDisconnection method now handles status updates internally
                  await usersService.trackDisconnection(user._id);
                }
              } catch (error) {
                new Logger().error(error);
              }
            },
          },
        },
      }),
      imports: [AuthModule, UsersModule],
      inject: [AuthService, UsersService],
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
