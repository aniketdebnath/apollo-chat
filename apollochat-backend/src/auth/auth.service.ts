/**
 * Authentication Service
 */
import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpVerification } from './entities/otp.entity';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/email/email.service';

/**
 * Provides core authentication functionality for the Apollo Chat application.
 * Handles user login, token management, OTP verification, and password reset flows.
 * Implements secure JWT-based authentication with refresh token rotation.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(OtpVerification.name)
    private otpModel: Model<OtpVerification>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Authenticates a user and sets authentication cookies
   *
   * @param user - The authenticated user entity
   * @param response - Express response object for setting cookies
   * @param request - Optional Express request object for tracking client info
   * @returns Object indicating success status
   * @throws UnauthorizedException if login process fails
   */
  async login(
    user: User,
    response: Response,
    request?: Request,
  ): Promise<{ success: boolean }> {
    try {
      // Generate access token
      const accessToken = this.generateAccessToken(user);

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(
        user._id.toHexString(),
        request?.headers['user-agent'],
        request?.ip,
      );

      // Set cookies
      this.setTokenCookies(response, accessToken, refreshToken);

      return { success: true };
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Generates a JWT access token for a user
   *
   * @param user - The user entity to generate token for
   * @returns JWT token string
   */
  private generateAccessToken(user: User): string {
    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      email: user.email,
      username: user.username,
      imageUrl: user.imageUrl,
    };

    return this.jwtService.sign(tokenPayload);
  }

  /**
   * Generates a refresh token and stores it in the database
   *
   * @param userId - User ID to associate with the token
   * @param userAgent - Optional user agent string for tracking client
   * @param ipAddress - Optional IP address for tracking client
   * @returns Generated refresh token string
   */
  private async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        Number(this.configService.get('REFRESH_TOKEN_EXPIRY_DAYS', '7')),
    );

    const refreshToken = new this.refreshTokenModel({
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });

    await refreshToken.save();

    return token;
  }

  /**
   * Sets authentication and refresh token cookies on the response
   *
   * @param response - Express response object
   * @param accessToken - JWT access token to set
   * @param refreshToken - Refresh token to set
   */
  private setTokenCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const accessExpires = new Date();
    accessExpires.setSeconds(
      accessExpires.getSeconds() +
        this.configService.getOrThrow('JWT_EXPIRATION'),
    );

    const refreshExpires = new Date();
    refreshExpires.setDate(
      refreshExpires.getDate() +
        Number(this.configService.get('REFRESH_TOKEN_EXPIRY_DAYS', '7')),
    );

    // Set access token cookie
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      expires: accessExpires,
      sameSite: 'strict',
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    // Set refresh token cookie - make it accessible from all paths
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      expires: refreshExpires,
      sameSite: 'strict',
      secure: this.configService.get('NODE_ENV') === 'production',
      // Removed path restriction so it's visible in cookie inspector
    });
  }

  /**
   * Refreshes authentication tokens using a valid refresh token
   *
   * @param refreshToken - Current refresh token
   * @param response - Express response object for setting new cookies
   * @param request - Optional Express request object for tracking client info
   * @returns Object indicating success status
   * @throws UnauthorizedException if refresh token is invalid or expired
   */
  async refresh(refreshToken: string, response: Response, request?: Request) {
    // Find valid refresh token
    const tokenDoc = await this.refreshTokenModel
      .findOne({
        token: refreshToken,
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!tokenDoc) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.usersService.findOne(tokenDoc.userId.toString());

    // Revoke old token
    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();

    // Generate new tokens
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(
      user._id.toString(),
      request?.headers['user-agent'],
      request?.ip,
    );

    // Set new cookies
    this.setTokenCookies(response, accessToken, newRefreshToken);

    return { success: true };
  }

  /**
   * Verifies WebSocket connection authentication from cookies
   *
   * @param request - Express request object containing cookies
   * @returns TokenPayload object with user information
   * @throws Error if authentication cookie is missing or invalid
   */
  verifyWs(request: Request): TokenPayload {
    if (!request.headers.cookie) {
      throw new Error('No cookies found');
    }

    const cookies: string[] = request.headers.cookie.split('; ');
    const authCookie = cookies.find((cookie) =>
      cookie.includes('Authentication'),
    );

    if (!authCookie) {
      throw new Error('Authentication cookie not found');
    }

    const jwt = authCookie.split('Authentication=')[1];

    // Define and use the JwtPayload interface
    interface JwtPayload {
      _id: string;
      email: string;
      username: string;
      imageUrl?: string;
      iat: number;
      exp: number;
    }

    const payload = this.jwtService.verify<JwtPayload>(jwt);

    const tokenPayload: TokenPayload = {
      _id: payload._id,
      email: payload.email,
      username: payload.username,
      imageUrl: payload.imageUrl || '',
    };

    return tokenPayload;
  }

  /**
   * Logs out a user by revoking their refresh token and clearing cookies
   *
   * @param refreshToken - Current refresh token to revoke
   * @param response - Express response object for clearing cookies
   * @returns Object indicating success status
   */
  async logout(refreshToken: string, response: Response) {
    try {
      // Revoke the refresh token if provided
      if (refreshToken) {
        await this.refreshTokenModel.findOneAndUpdate(
          { token: refreshToken },
          { revoked: true, revokedAt: new Date() },
        );
      }

      // Clear both cookies
      response.cookie('Authentication', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      response.cookie('Refresh', '', {
        httpOnly: true,
        expires: new Date(0),
        // Removed path restriction to match the cookie setting
      });

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: 'Failed to logout properly' };
    }
  }

  /**
   * Revokes all active refresh tokens for a user (logout from all devices)
   *
   * @param userId - ID of the user whose tokens should be revoked
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany(
        { userId: new Types.ObjectId(userId), revoked: false },
        { revoked: true, revokedAt: new Date() },
      )
      .exec();
  }

  /**
   * Retrieves all active sessions for a user
   *
   * @param userId - ID of the user whose sessions to retrieve
   * @returns Array of session information including user agent and IP
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const sessions = await this.refreshTokenModel
      .find({
        userId: new Types.ObjectId(userId),
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .select('userAgent ipAddress')
      .exec();

    return sessions;
  }

  /**
   * Generates and sends a one-time password (OTP) to the user's email
   *
   * @param email - Email address to send OTP to
   * @returns Boolean indicating if the OTP was successfully sent
   */
  async generateAndSendOtp(email: string): Promise<boolean> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete any existing OTPs for this email
    await this.otpModel.deleteMany({ email });

    // Create new OTP document
    const otpVerification = new this.otpModel({
      _id: new Types.ObjectId(),
      email,
      otp,
      expiresAt,
    });

    await otpVerification.save();

    // Send OTP via email
    const emailSent = await this.emailService.sendOtpEmail(email, otp);

    // For development, still log the OTP
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`OTP for ${email}: ${otp}`);
    }

    return emailSent;
  }

  /**
   * Verifies a one-time password (OTP) for a given email
   *
   * @param email - Email address associated with the OTP
   * @param otp - The OTP code to verify
   * @returns Boolean indicating if the OTP is valid
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpDoc = await this.otpModel.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpDoc) {
      return false;
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    return true;
  }

  /**
   * Checks if an email has been verified with OTP
   *
   * @param email - Email address to check
   * @returns Boolean indicating if the email has been verified
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const verifiedOtp = await this.otpModel.findOne({
      email,
      verified: true,
    });

    return !!verifiedOtp;
  }

  /**
   * Sends a welcome email to a user after successful verification
   *
   * @param email - Email address to send welcome message to
   * @param username - Username to personalize the welcome message
   * @returns Boolean indicating if the email was sent successfully
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return this.emailService.sendWelcomeEmail(email, username);
  }

  /**
   * Initiates a password reset process by sending an OTP
   *
   * @param email - Email address for the account to reset
   * @returns Boolean indicating if the reset process was initiated successfully
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return true even if user doesn't exist for security reasons
      // This prevents user enumeration attacks
      return true;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete any existing OTPs for this email
    await this.otpModel.deleteMany({ email });

    // Create new OTP document
    const otpVerification = new this.otpModel({
      _id: new Types.ObjectId(),
      email,
      otp,
      expiresAt,
    });

    await otpVerification.save();

    // Send password reset email
    const emailSent = await this.emailService.sendPasswordResetEmail(
      email,
      otp,
    );

    // For development, still log the OTP
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`Password reset OTP for ${email}: ${otp}`);
    }

    return emailSent;
  }

  /**
   * Verifies an OTP for password reset
   *
   * @param email - Email address associated with the OTP
   * @param otp - The OTP code to verify
   * @returns Boolean indicating if the OTP is valid
   */
  async verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    // Reuse the existing OTP verification
    return this.verifyOtp(email, otp);
  }

  /**
   * Resets a user's password after OTP verification
   *
   * @param email - Email address of the account
   * @param newPassword - New password to set
   * @returns Boolean indicating if the password was reset successfully
   */
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      // Validate inputs
      if (!email || !newPassword || newPassword.trim() === '') {
        return false;
      }

      // Check if email has been verified with OTP
      const isVerified = await this.isEmailVerified(email);
      if (!isVerified) {
        return false;
      }

      // Find user and update password
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return false;
      }

      // Update the password - this should throw an error if it fails
      const passwordUpdated = await this.usersService.updatePassword(
        user._id.toString(),
        newPassword,
      );
      if (!passwordUpdated) {
        return false;
      }

      // Only revoke tokens if password was successfully updated
      await this.revokeAllUserTokens(user._id.toString());

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error resetting password: ${errorMessage}`);
      return false;
    }
  }
}
