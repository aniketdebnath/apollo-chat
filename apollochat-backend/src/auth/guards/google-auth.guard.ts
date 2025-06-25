/**
 * Google Authentication Guard
 *
 * Protects routes that require Google OAuth authentication.
 * Uses the Google strategy to handle the OAuth flow.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that implements Google OAuth authentication for REST endpoints
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
