import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

import { PublicDecorator } from '../decorator/public.decorator.js';
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
    private readonly reflector: Reflector,

    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,

    private readonly jwtLibService: JwtLibService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if route is public, allow access
    const publicRoute = this.reflector.get(PublicDecorator, context.getHandler());
    if (publicRoute === true) return true;

    // for protected routes, validate access token and attach user to request
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer') {
      throw new AppException({ message: 'Invalid Bearer Token', error: {} }, HttpStatus.UNAUTHORIZED, {
        cause: {},
        description: 'AuthGuard',
      });
    }

    const payload = await this.jwtLibService.decodeAccessToken(token);

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
