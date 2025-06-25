/**
 * Authentication Controller

 */
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

/**
 * Controller that provides REST endpoints for authentication operations
 * Handles HTTP endpoints for authentication operations including login, logout,
 * OAuth flows, OTP verification, and password reset functionality.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Authenticates a user with email and password
   *
   * @param user - User entity from LocalAuthGuard
   * @param response - Express response for setting cookies
   * @param request - Express request for client information
   * @returns Authenticated user information
   */
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

  /**
   * Special endpoint for demo account login
   * Allows easy access to a demo account without registration
   *
   * @param response - Express response for setting cookies
   * @param request - Express request for client information
   * @returns Demo user information
   * @throws UnauthorizedException if demo user not found
   */
  @Post('demo-login')
  async demoLogin(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    try {
      // Find the demo user
      const demoUser = await this.usersService.findByEmail(
        'demo@apollochat.com',
      );
      if (!demoUser) {
        throw new UnauthorizedException('Demo user not found');
      }

      // Login the demo user
      await this.authService.login(demoUser, response, request);
      return demoUser;
    } catch (error) {
      throw new UnauthorizedException('Demo login failed');
    }
  }

  /**
   * Initiates Google OAuth authentication flow
   * Redirects user to Google login page
   *
   * @returns Never directly returns (redirects to Google)
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // This method doesn't need any implementation
    // The guard will handle the Google OAuth flow
    return { msg: 'Google Authentication' };
  }

  /**
   * Handles Google OAuth callback after successful authentication
   * Sets authentication cookies and redirects to frontend
   *
   * @param user - User entity from GoogleAuthGuard
   * @param response - Express response for redirects and cookies
   * @param request - Express request for client information
   */
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

  /**
   * Refreshes authentication tokens using refresh token cookie
   *
   * @param request - Express request containing refresh token cookie
   * @param response - Express response for setting new cookies
   * @returns Object indicating success status
   * @throws UnauthorizedException if refresh token is invalid
   */
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

  /**
   * Logs out the current user by clearing cookies and invalidating refresh token
   *
   * @param request - Express request containing refresh token cookie
   * @param response - Express response for clearing cookies
   * @returns Object indicating success status
   */
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

  /**
   * Logs out the user from all devices by revoking all refresh tokens
   *
   * @param user - Current authenticated user
   * @param response - Express response for clearing cookies
   * @param request - Express request containing refresh token cookie
   * @returns Object indicating success status
   */
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

  /**
   * Provides Google OAuth configuration details for the frontend
   *
   * @returns Object with Google OAuth configuration
   */
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

  /**
   * Sends a one-time password (OTP) to the specified email
   * Rate limited by OtpThrottlerGuard
   *
   * @param email - Email address to send OTP to
   * @returns Object indicating success status
   */
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

  /**
   * Verifies a one-time password (OTP) for a given email
   * Rate limited by OtpThrottlerGuard
   *
   * @param email - Email address associated with the OTP
   * @param otp - The OTP code to verify
   * @returns Object indicating success status
   * @throws UnauthorizedException if OTP is invalid
   */
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

  /**
   * Checks if an email has been verified with OTP
   * Rate limited by OtpThrottlerGuard
   *
   * @param email - Email address to check
   * @returns Object with verification status
   */
  @Post('check-email-verified')
  @UseGuards(OtpThrottlerGuard)
  async checkEmailVerified(@Body() { email }: { email: string }) {
    const isVerified = await this.authService.isEmailVerified(email);
    return { verified: isVerified };
  }

  /**
   * Initiates a password reset process by sending an OTP
   * Rate limited by OtpThrottlerGuard
   *
   * @param email - Email address for the account to reset
   * @returns Object indicating success status (always returns success for security)
   */
  @Post('request-password-reset')
  @UseGuards(OtpThrottlerGuard)
  async requestPasswordReset(@Body() { email }: { email: string }) {
    try {
      const result = await this.authService.requestPasswordReset(email);
      // Always return success even if email doesn't exist for security reasons
      return { success: result };
    } catch (error: unknown) {
      // Log the error but don't expose details to client
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error requesting password reset: ${errorMessage}`);
      return { success: false, error: 'Failed to process request' };
    }
  }

  /**
   * Verifies an OTP for password reset
   * Rate limited by OtpThrottlerGuard
   *
   * @param email - Email address associated with the OTP
   * @param otp - The OTP code to verify
   * @returns Object indicating success status
   * @throws UnauthorizedException if OTP is invalid
   */
  @Post('verify-reset-otp')
  @UseGuards(OtpThrottlerGuard)
  async verifyResetOtp(@Body() { email, otp }: { email: string; otp: string }) {
    const isVerified = await this.authService.verifyPasswordResetOtp(
      email,
      otp,
    );
    if (!isVerified) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    return { success: true };
  }

  /**
   * Resets a user's password after OTP verification
   * Rate limited by OtpThrottlerGuard
   *
   * @param body - Object containing email and new password
   * @returns Object indicating success status
   * @throws UnauthorizedException if password reset fails
   */
  @Post('reset-password')
  @UseGuards(OtpThrottlerGuard)
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    // Validate required fields
    if (!body.email || !body.newPassword || body.newPassword.trim() === '') {
      throw new UnauthorizedException('Email and new password are required');
    }

    const success = await this.authService.resetPassword(
      body.email,
      body.newPassword,
    );
    if (!success) {
      throw new UnauthorizedException(
        'Failed to reset password. Please verify your email with OTP first.',
      );
    }
    return { success: true, message: 'Password has been reset successfully' };
  }
}
