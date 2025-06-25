/**
 * Authentication Module
 */
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Services
import { AuthService } from './auth.service';

// Authentication strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

// Guards
import { OtpThrottlerGuard } from './guards/otp-throttler.guard';

// Controllers
import { AuthController } from './auth.controller';

// Modules
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../common/email/email.module';
import { DatabaseModule } from '../common/database/database.module';

// Entities
import {
  RefreshToken,
  RefreshTokenSchema,
} from './entities/refresh-token.entity';
import { OtpVerification, OtpVerificationSchema } from './entities/otp.entity';

/**
 * Authentication module that handles user authentication and authorization.
 *
 * Features:
 * - JWT-based authentication with refresh tokens
 * - Local authentication (username/password)
 * - Google OAuth integration
 * - OTP verification system with rate limiting
 * - Secure token management
 */
@Module({
  imports: [
    // Circular dependency with UsersModule (users need auth, auth needs users)
    forwardRef(() => UsersModule),

    // Email service for OTP delivery
    EmailModule,

    // JWT configuration with environment variables
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.getOrThrow('JWT_EXPIRATION')),
        },
      }),
      inject: [ConfigService],
    }),

    // Database schemas for authentication entities
    DatabaseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: OtpVerification.name, schema: OtpVerificationSchema },
    ]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    OtpThrottlerGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
