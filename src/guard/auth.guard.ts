import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

import { AppException } from '../exception/appException.exception.js';
import { JwtLibService } from '../lib/jwt.lib.js';
import { UserModel } from '../model/user.model.js';
import { CurrentUserType } from '../type/currentUser.type.js';

declare module 'express-serve-static-core' {
  interface Request {
    user: CurrentUserType;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,

    private readonly jwtLibService: JwtLibService
  ) {}

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

    const user = (await this.userModel
      .findById(payload.id)
      .lean()
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0 })) as CurrentUserType;

    if (!user) {
      throw new AppException({ message: 'Invalid Access Token', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: { userId: payload.id },
        description: 'AuthGuard',
      });
    }

    if (!user.verified) {
      throw new AppException({ message: 'User not verified', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: { userId: payload.id },
        description: 'AuthGuard',
      });
    }

    if (!user.active) {
      throw new AppException({ message: 'User not active', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: { userId: payload.id },
        description: 'AuthGuard',
      });
    }

    request.user = user;

    return true;
  }
}
