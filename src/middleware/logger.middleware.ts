/**
 * LoggerMiddleware is applied in AppModule to log all incoming requests to the API.
 * But can be applied in any module to log "all requests from all routes in any module"
 *
 * NestJS middleware is built on top of Express middleware. When you call consumer.apply(LoggerMiddleware).forRoutes('*')
 * NestJS registers it as app.use('*', LoggerMiddleware) at the Express application level — not scoped to the module.
 *
 * if LoggerMiddleware is applied in AppModule, then it can use providers mentioned in AppModule only, not from any other module
 * if LoggerMiddleware is applied in HealthModule, then it can use providers mentioned in HealthModule only, not from any other module including AppModule
 *
 * req.user is not available in LoggerMiddleware because it is applied before the AuthGuard which populates req.user
 * Request > Middleware > Guards > Interceptors > Pipes > Controllers > Services > Interceptors > Exception Filters > Response
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const log = {
      method: req.method,
      url: req.originalUrl,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      authorization: req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None',
      timestamp: new Date().toISOString(),
    };

    console.log('\n------------------------------------------------------------\n', log);
    next();
  }
}
