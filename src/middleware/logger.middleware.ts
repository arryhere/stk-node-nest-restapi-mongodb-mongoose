/**
 * LoggerMiddleware is applied in AppModule to log all incoming requests to the API.
 * But can be applied in any module to log "all requests from all routes in any module"
 *
 * NestJS middleware is built on top of Express middleware. When you call consumer.apply(LoggerMiddleware).forRoutes('*')
 * NestJS registers it as app.use('*', LoggerMiddleware) at the Express application level — not scoped to the module.
 *
 * Nest middleware fully supports Dependency Injection
 * Just as with providers and controllers, they are able to inject dependencies that are available within the same module
 * if LoggerMiddleware is applied in AppModule, then it can use providers mentioned in AppModule only, not from any other module
 * if LoggerMiddleware is applied in HealthModule, then it can use providers mentioned in HealthModule only, not from any other module including AppModule
 * if LoggerMiddleware is registered in AppModule and it wants to inject HealthService, then HealthModule must export HealthService and AppModule must import HealthModule.
 *
 * req.user is not available in LoggerMiddleware because it is applied before the AuthGuard which populates req.user
 * Request > Middleware > Guards > Interceptors > Pipes > Controllers > Services > Interceptors > Exception Filters > Response
 *
 */

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config/appConfig.js';
import { AppEnvEnum } from '../type/appEnv.enum.js';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}

  private readonly logger = new Logger(LoggerMiddleware.name);

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'secret', 'phoneNumber'];
    return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, SENSITIVE_KEYS.includes(key) ? '[REDACTED]' : value]));
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const log = {
      method: req.method,
      path: req.originalUrl.split('?')[0],
      body: req.body ? this.sanitizeBody(req.body) : undefined,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      authorization: req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None',
      timestamp: new Date().toISOString(),
      debugNonProd:
        appConfig.app.APP_ENV !== AppEnvEnum.PROD
          ? {
              url: req.originalUrl,
              body: req.body,
            }
          : undefined,
    };

    console.log('\n------------------------------------------------------------------------------------------');
    this.logger.log(log);

    next();
  }
}
