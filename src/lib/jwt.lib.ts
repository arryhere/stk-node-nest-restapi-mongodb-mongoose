import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { appConfig } from '../config/appConfig.js';
import { AppException } from '../exception/appException.exception.js';

type IJwtPayload = {
  id: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtLibService {
  constructor(private readonly jwtService: JwtService) {}

  // 🔐 VERIFY TOKEN
  async encodeVerifyToken(payload: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_VERIFY_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.VERIFY_TOKEN_EXPIRATION,
    });
  }

  async decodeVerifyToken(token: string): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.JWT_VERIFY_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeVerifyToken',
      });
    }
  }

  // 🔑 ACCESS TOKEN
  async encodeAccessToken(payload: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async decodeAccessToken(token: string): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.JWT_ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeAccessToken',
      });
    }
  }

  // 🔄 REFRESH TOKEN
  async encodeRefreshToken(payload: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.REFRESH_TOKEN_EXPIRATION,
    });
  }

  async decodeRefreshToken(token: string): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeRefreshToken',
      });
    }
  }

  // 🔑 FORGOT PASSWORD TOKEN
  async encodeForgotPasswordToken(payload: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_FORGOT_PASSWORD_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.FORGOT_PASSWORD_TOKEN_EXPIRATION,
    });
  }

  async decodeForgotPasswordToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.JWT_FORGOT_PASSWORD_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeForgotPasswordToken',
      });
    }
  }
}

@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [JwtLibService],
  exports: [JwtLibService],
})
export class JwtLibModule {}
