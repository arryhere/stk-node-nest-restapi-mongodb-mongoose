import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { appConfig } from '../../config/appConfig.js';

@Injectable()
export class AuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  // 🔐 VERIFY TOKEN
  async encodeVerifyToken(payload: { id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_VERIFY_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.VERIFY_TOKEN_EXPIRATION,
    });
  }

  async decodeVerifyToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: appConfig.jwt.JWT_VERIFY_TOKEN_SECRET,
    });
  }

  // 🔑 ACCESS TOKEN
  async encodeAccessToken(payload: { id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async decodeAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: appConfig.jwt.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  // 🔄 REFRESH TOKEN
  async encodeRefreshToken(payload: { id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.REFRESH_TOKEN_EXPIRATION,
    });
  }

  async decodeRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: appConfig.jwt.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  // 🔑 FORGOT PASSWORD TOKEN
  async encodeForgotPasswordToken(payload: { id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.JWT_FORGOT_PASSWORD_TOKEN_SECRET,
      expiresIn: appConfig.tokenExpiration.FORGOT_PASSWORD_TOKEN_EXPIRATION,
    });
  }

  async decodeForgotPasswordToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: appConfig.jwt.JWT_FORGOT_PASSWORD_TOKEN_SECRET,
    });
  }
}
