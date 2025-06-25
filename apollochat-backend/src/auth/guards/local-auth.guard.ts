/**
 * Local Authentication Guard
 *
 * Protects routes that require username/password authentication.
 * Uses the Local strategy to validate credentials from request body.
 */
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that implements username/password authentication for REST endpoints
 */
export class LocalAuthGuard extends AuthGuard('local') {}
