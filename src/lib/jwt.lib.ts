import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { appConfig } from '../config/appConfig.js';
import { AppException } from '../exception/appException.exception.js';
import { RoleEnum } from '../model/user.model.js';
import { JwtAccessTokenPayloadType, JwtRefreshTokenPayloadType } from '../type/jwtPayload.type.js';

@Injectable()
export class JwtLibService {
  constructor(private readonly jwtService: JwtService) {}

  // 🔑 ACCESS TOKEN
  async encodeAccessToken(payload: { id: string; role: RoleEnum }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.tokenSecret.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async decodeAccessToken(token: string): Promise<JwtAccessTokenPayloadType> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.tokenSecret.JWT_ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeAccessToken',
      });
    }
  }

  // 🔄 REFRESH TOKEN
  async encodeRefreshToken(payload: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: appConfig.tokenSecret.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.REFRESH_TOKEN_EXPIRATION,
    });
  }

  async decodeRefreshToken(token: string): Promise<JwtRefreshTokenPayloadType> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: appConfig.tokenSecret.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new AppException({ message: 'Invalid or expired token', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: error,
        description: 'decodeRefreshToken',
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
