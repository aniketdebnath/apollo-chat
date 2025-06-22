import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './entities/refresh-token.entity';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async login(user: User, response: Response, request?: Request) {
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
  }

  private generateAccessToken(user: User): string {
    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      email: user.email,
      username: user.username,
      imageUrl: user.imageUrl,
    };

    return this.jwtService.sign(tokenPayload);
  }

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

  // Method to revoke all refresh tokens for a user (for logout from all devices)
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany(
        { userId: new Types.ObjectId(userId), revoked: false },
        { revoked: true, revokedAt: new Date() },
      )
      .exec();
  }

  // Method to get all active sessions for a user
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
}
