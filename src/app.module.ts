import { HttpStatus, MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { appConfig } from './config/appConfig.js';
import { AppException } from './exception/appException.exception.js';
import { GlobalExceptionFilter } from './exception/globalExceptionFilter.exception.js';
import { AuthGuard } from './guard/auth.guard.js';
import { RoleGuard } from './guard/role.guard.js';
import { ResponseValidationInterceptor } from './interceptor/responseValidation.interceptor.js';
import { TimeoutInterceptor } from './interceptor/timeout.interceptor.js';
import { JwtLibModule } from './lib/jwt.lib.js';
import { LoggerMiddleware } from './middleware/logger.middleware.js';
import { TokenModelModule } from './model/token.model.js';
import { UserModelModule } from './model/user.model.js';
import { AuthModule } from './module/auth/auth.module.js';
import { HealthModule } from './module/health/health.module.js';
import { UserModule } from './module/user/user.module.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({ useFactory: () => ({ uri: appConfig.mongodb.MONGODB_URI }) }),

    // mongodb model modules
    UserModelModule,
    TokenModelModule,

    // application modules
    HealthModule,
    AuthModule,
    UserModule,

    // modules for di'ng global guards, interceptors, pipes, filters
    JwtLibModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },

    // interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseValidationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },

    // pipes
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const sanitizedErrors = errors.map((err) => ({
            field: err.property,
            constraints: Object.values(err.constraints || {}),
          }));
          return new AppException({ message: 'Validation Failed', error: sanitizedErrors }, HttpStatus.BAD_REQUEST, {
            cause: errors,
            description: 'ValidationPipe',
          });
        },
      }),
    },

    // filters
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
