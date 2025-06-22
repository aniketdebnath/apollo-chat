import {
  Controller,
  Post,
  Get,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { OtpThrottlerGuard } from './guards/otp-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    await this.authService.login(user, response, request);
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // This method doesn't need any implementation
    // The guard will handle the Google OAuth flow
    return { msg: 'Google Authentication' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      if (!user) {
        return response.redirect('http://localhost:3000/login?error=no_user');
      }

      // Login the user and set cookies
      this.authService.login(user, response, request);

      // Redirect to the frontend
      const redirectUrl =
        this.configService.get<string>('AUTH_REDIRECT_URL') ||
        'http://localhost:3000/home';

      // Use setTimeout to ensure cookies are set before redirecting
      setTimeout(() => {
        response.redirect(redirectUrl);
      }, 100);

      return;
    } catch (error) {
      return response.redirect(
        'http://localhost:3000/login?error=authentication_failed',
      );
    }
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies?.Refresh;

      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }

      return this.authService.refresh(refreshToken, response, request);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies?.Refresh;
      if (refreshToken) {
        await this.authService.logout(refreshToken, response);
      } else {
        // If no refresh token, just clear cookies
        response.cookie('Authentication', '', {
          httpOnly: true,
          expires: new Date(0),
        });
        response.cookie('Refresh', '', {
          httpOnly: true,
          expires: new Date(0),
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to logout properly' };
    }
  }

  @Post('logout-all')
  @UseGuards(LocalAuthGuard)
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    try {
      // Revoke all refresh tokens
      await this.authService.revokeAllUserTokens(user._id.toHexString());

      // Also logout current session
      const refreshToken = request.cookies?.Refresh;
      if (refreshToken) {
        await this.authService.logout(refreshToken, response);
      } else {
        // If no refresh token, just clear cookies
        response.cookie('Authentication', '', {
          httpOnly: true,
          expires: new Date(0),
        });
        response.cookie('Refresh', '', {
          httpOnly: true,
          expires: new Date(0),
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to logout all sessions properly',
      };
    }
  }

  @Get('google-config')
  googleConfig() {
    const config = {
      clientId:
        this.configService.get<string>('GOOGLE_CLIENT_ID')?.substring(0, 10) +
        '...',
      callbackUrl: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      redirectUrl: this.configService.get<string>('AUTH_REDIRECT_URL'),
      frontendUrl: this.configService.get<string>('FRONTEND_URL'),
    };
    return config;
  }

  @Post('send-otp')
  @UseGuards(OtpThrottlerGuard)
  async sendOtp(@Body() { email }: { email: string }) {
    try {
      const result = await this.authService.generateAndSendOtp(email);
      return { success: result };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  @Post('verify-otp')
  @UseGuards(OtpThrottlerGuard)
  async verifyOtp(@Body() { email, otp }: { email: string; otp: string }) {
    const isVerified = await this.authService.verifyOtp(email, otp);
    if (!isVerified) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Try to find the user to send a welcome email
    try {
      const user = await this.usersService.findByEmail(email);
      if (user) {
        await this.authService.sendWelcomeEmail(email, user.username);
      }
    } catch (error: unknown) {
      // Don't fail verification if welcome email fails
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to send welcome email: ${errorMessage}`);
    }

    return { success: true };
  }

  @Post('check-email-verified')
  @UseGuards(OtpThrottlerGuard)
  async checkEmailVerified(@Body() { email }: { email: string }) {
    const isVerified = await this.authService.isEmailVerified(email);
    return { verified: isVerified };
  }
}
