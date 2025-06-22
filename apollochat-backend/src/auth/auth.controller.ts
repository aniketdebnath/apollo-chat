import {
  Controller,
  Post,
  Get,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    this.authService.login(user, response, request);
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
}
