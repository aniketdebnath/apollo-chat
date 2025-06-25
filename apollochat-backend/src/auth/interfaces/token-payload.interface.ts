/**
 * Token Payload Interface
 *
 * Defines the structure of data stored in JWT access tokens.
 * Contains essential user information needed for authentication and authorization.
 */
export interface TokenPayload {
  /**
   * User's unique identifier
   */
  _id: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's display name
   */
  username: string;

  /**
   * Optional URL to user's avatar image
   */
  imageUrl?: string;
}
