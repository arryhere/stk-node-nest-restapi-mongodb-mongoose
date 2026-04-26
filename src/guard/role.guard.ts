import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PublicDecorator } from '../decorator/public.decorator.js';
import { RoleDecorator } from '../decorator/role.decorator.js';
import { AppException } from '../exception/appException.exception.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if route is public, allow access
    const publicRoute = this.reflector.get(PublicDecorator, context.getHandler());
    if (publicRoute === true) return true;

    // for protected routes, validate user role against required roles
    const request = context.switchToHttp().getRequest<Request>();

    const roles = this.reflector.get(RoleDecorator, context.getHandler());

    if (!roles || !roles?.length) return true;

    if (!roles.includes(request.user.role)) {
      throw new AppException({ message: 'Invalid Role', error: {} }, HttpStatus.FORBIDDEN, {
        cause: { requiredRoles: roles.join(', '), providedRole: request.user.role },
        description: 'RoleGuard',
      });
    }

    return true;
  }
}
