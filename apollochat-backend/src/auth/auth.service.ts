import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../users/constants/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User, response: Response) {
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.getOrThrow('JWT_EXPIRATION'),
    );

    const tokenPayload: TokenPayload = {
      ...user,
      _id: user._id.toHexString(),
      status:
        user.status && typeof user.status === 'string'
          ? (user.status.toUpperCase() as UserStatus)
          : UserStatus.OFFLINE,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
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

    interface JwtPayload {
      _id: string;
      email: string;
      username: string;
      status?: string;
      imageUrl?: string;
      iat: number;
      exp: number;
    }

    const payload = this.jwtService.verify(jwt);

    const tokenPayload: TokenPayload = {
      _id: payload._id,
      email: payload.email,
      username: payload.username,
      imageUrl: payload.imageUrl || '',
      status: UserStatus.OFFLINE,
    };

    if (payload.status && typeof payload.status === 'string') {
      const upperStatus = payload.status.toUpperCase();
      if (Object.values(UserStatus).includes(upperStatus as UserStatus)) {
        tokenPayload.status = upperStatus as UserStatus;
      }
    }

    return tokenPayload;
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
