/**
 * Local Authentication Strategy
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/users.service';

/**
 * Local Strategy for Passport authentication
 *
 * Configures Passport to use email/password authentication
 * and validates credentials against the database.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates a new Local strategy instance
   *
   * @param usersService - Service for user operations and validation
   */
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Validates user credentials
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns The authenticated user entity if credentials are valid
   * @throws UnauthorizedException if credentials are invalid
   */
  async validate(email: string, password: string) {
    try {
      return await this.usersService.verifyUser(email, password);
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }
}
