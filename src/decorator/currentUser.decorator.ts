import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { CurrentUserType } from '../type/currentUser.type.js';

export const CurrentUserDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext): CurrentUserType => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user;
});
