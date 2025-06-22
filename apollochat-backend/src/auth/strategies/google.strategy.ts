import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
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
