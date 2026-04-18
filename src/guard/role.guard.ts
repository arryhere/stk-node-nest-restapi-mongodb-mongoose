import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { RoleDecorator } from '../decorator/role.decorator.js';
import { AppException } from '../exception/appException.exception.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const roles = this.reflector.get(RoleDecorator, context.getHandler());

    if (roles.length === 0 || !roles) return true;

    if (!roles.includes(request.user.role)) {
      throw new AppException({ message: 'Invalid Role', error: {} }, HttpStatus.FORBIDDEN, {
        cause: { requiredRoles: roles.join(', '), userRole: request.user.role },
        description: 'RoleGuard',
      });
    }

    return true;
  }
}
