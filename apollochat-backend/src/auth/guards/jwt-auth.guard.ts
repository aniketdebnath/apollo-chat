/**
 * JWT Authentication Guard
 *
 * Protects routes that require JWT authentication.
 * Uses the JWT strategy to validate tokens from request cookies.
 */
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that implements JWT authentication for REST endpoints
 */
export class JwtAuthGuard extends AuthGuard('jwt') {}
