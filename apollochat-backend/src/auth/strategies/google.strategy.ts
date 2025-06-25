/**
 * Google OAuth Authentication Strategy
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * Google OAuth Strategy for Passport authentication
 *
 * Configures Passport to use Google OAuth 2.0 authentication
 * and handles user creation/retrieval based on Google profile data.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  /**
   * Creates a new Google strategy instance
   *
   * @param configService - NestJS ConfigService for accessing environment variables
   * @param usersService - Service for user operations and account creation
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || '';
    const clientSecret =
      configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || '';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validates the Google profile and finds or creates a user
   *
   * @param accessToken - OAuth access token from Google (not stored)
   * @param refreshToken - OAuth refresh token from Google (not stored)
   * @param profile - User profile information from Google
   * @returns The user entity (existing or newly created)
   * @throws Error if email is not provided by Google
   */
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    if (!profile.emails || profile.emails.length === 0) {
      throw new Error('No email provided by Google OAuth');
    }

    const email = profile.emails[0].value;
    const username = profile.displayName || email.split('@')[0];
    const imageUrl =
      profile.photos && profile.photos.length > 0
        ? profile.photos[0].value
        : undefined;

    // Find or create user with Google ID
    const user = await this.usersService.findOrCreateGoogleUser({
      googleId: profile.id,
      email,
      username,
      imageUrl,
    });

    return user;
  }
}
