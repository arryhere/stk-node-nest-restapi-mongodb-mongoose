import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AppException } from '../exception/appException.exception.js';
import { JwtLibService } from '../lib/jwt.lib.js';
import { TJwtPayload } from '../type/jwtPayload.type.js';

declare module 'express-serve-static-core' {
  interface Request {
    user: TJwtPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtLibService: JwtLibService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const validToken = type === 'Bearer' ? token : null;

    if (!validToken) {
      throw new AppException({ message: 'Invalid Access Token', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: {},
        description: 'AuthGuard',
      });
    }

    const payload = await this.jwtLibService.decodeAccessToken(validToken);

    request.user = payload;

    return true;
  }
}
