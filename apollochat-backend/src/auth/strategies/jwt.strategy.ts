/**
 * JWT Authentication Strategy
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'process';
import { TokenPayload } from '../interfaces/token-payload.interface';

/**
 * JWT Strategy for Passport authentication
 *
 * Configures Passport to extract JWT tokens from cookies and validate them
 * using the application's JWT secret key.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates a new JWT strategy instance
   *
   * @param configService - NestJS ConfigService for accessing environment variables
   */
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Authentication,
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload
   *
   * @param payload - The decoded JWT payload
   * @returns The user payload to be added to the request object
   */
  validate(payload: TokenPayload) {
    return payload;
  }
}
