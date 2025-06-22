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
import { SecurityModule } from './common/security/security.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SecurityInterceptor } from './common/security/security.interceptor';
import { DemoUserInterceptor } from './common/interceptors/demo-user.interceptor';
import { Request, Response, CookieOptions } from 'express';
import { TokenPayload } from './auth/interfaces/token-payload.interface';
import { ThrottlerModule } from '@nestjs/throttler';
import { EmailModule } from './common/email/email.module';

// Define WebSocket context interface
interface WsContext {
  extra?: {
    request?: Partial<Request> & {
      headers: {
        cookie: string;
      };
      newCookies?: Record<string, { value: string; options: CookieOptions }>;
    };
  };
  user?: TokenPayload;
}

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
            onConnect: async (context: WsContext) => {
              try {
                const extra = context.extra || {};
                const request = extra.request;

                if (!request) {
                  throw new Error(
                    'No request object found in connection context',
                  );
                }

                try {
                  // Try to verify the access token first
                  const user = authService.verifyWs(request as Request);
                  // Assign to the context object
                  context.user = user;

                  // Track the connection and update status if it's the first connection
                  await usersService.trackConnection(user._id);
                } catch (error) {
                  // If access token verification fails, try to use refresh token
                  if (
                    error instanceof Error &&
                    error.name === 'TokenExpiredError'
                  ) {
                    const logger = new Logger('WebSocketAuth');
                    logger.log('Access token expired, attempting to refresh');

                    // Extract refresh token from cookies
                    const cookies: string[] =
                      request.headers.cookie.split('; ');
                    const refreshCookie = cookies.find((cookie) =>
                      cookie.includes('Refresh'),
                    );

                    if (!refreshCookie) {
                      logger.error('No refresh token found');
                      throw new UnauthorizedException('No refresh token found');
                    }

                    const refreshToken = refreshCookie.split('Refresh=')[1];

                    // Create a mock response object to handle cookie setting
                    const mockResponse = {
                      cookie: (
                        name: string,
                        value: string,
                        options: CookieOptions,
                      ) => {
                        // Store the new cookies in the request for future use
                        if (!request.newCookies) {
                          request.newCookies = {};
                        }
                        request.newCookies[name] = { value, options };
                      },
                    };

                    // Refresh the token
                    await authService.refresh(
                      refreshToken,
                      mockResponse as unknown as Response,
                      request as unknown as Request,
                    );

                    // Try to verify again with the new token
                    // We need to update the request's cookie with the new Authentication token
                    if (
                      request.newCookies &&
                      request.newCookies.Authentication
                    ) {
                      // Update the cookie in the request
                      const newAuthCookie = `Authentication=${request.newCookies.Authentication.value}`;
                      const cookieIndex = cookies.findIndex((c) =>
                        c.startsWith('Authentication='),
                      );

                      if (cookieIndex >= 0) {
                        cookies[cookieIndex] = newAuthCookie;
                      } else {
                        cookies.push(newAuthCookie);
                      }

                      request.headers.cookie = cookies.join('; ');
                    }

                    // Try verification again with the new token
                    const user = authService.verifyWs(request as Request);
                    context.user = user;

                    // Track the connection
                    await usersService.trackConnection(user._id);
                  } else {
                    // If it's not a token expiration issue, rethrow
                    throw error;
                  }
                }
              } catch (error) {
                new Logger().error(error);
                throw new UnauthorizedException();
              }
            },
            onDisconnect: async (context: WsContext) => {
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
    SecurityModule,
    ThrottlerModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DemoUserInterceptor,
    },
  ],
})
export class AppModule {}
