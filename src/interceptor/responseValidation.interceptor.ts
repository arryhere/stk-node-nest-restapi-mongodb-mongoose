/**
 * validation pipe will not catch the response although DTO is being made;
 * as pipes works on requests only and not responses;
 * hence we are using interceptor (can work for both request and response) to validate the response before sending it to the client)
 */

/**
 * app.useGlobalInterceptors() is global, but cannot do Dependency Injection (DI)
 * Thus we use APP_INTERCEPTOR token (in providers) to register global interceptors with DI support.
 *
 * Global interceptors are registered in AppModule using APP_INTERCEPTOR token.
 * Just a convention, can be applied in any module.
 * They apply to every route in the application automatically.
 *
 * A global interceptor can only inject providers that are available in provider of the module where it is registered (AppModule in this case).
 * It cannot inject providers from other modules (e.g. HealthService, AuthService)
 * If interceptor is registered in AppModule and it wants to inject HealthService, then HealthModule must export HealthService and AppModule must import HealthModule.
 *
 * Interceptor flow:
      Request
        ↓
      ResponseValidationInterceptor (pre)
        ↓
      TimeoutInterceptor (pre)
        ↓
      Route Handler
        ↓
      TimeoutInterceptor (post)
        ↓
      ResponseValidationInterceptor (post) ← validates response here
        ↓
      Response
 *
 */
import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { mergeMap, Observable } from 'rxjs';

import { AppException } from '../exception/appException.exception.js';
import { AppResponseDto } from '../type/appResponse.dto.js';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler<AppResponseDto>): Observable<AppResponseDto> {
    // const ctx = context.switchToHttp();
    // const request = ctx.getRequest();
    // const response = ctx.getResponse();

    return next.handle().pipe(
      mergeMap(async (data) => {
        const response = plainToInstance(AppResponseDto, data);

        try {
          await validateOrReject(response);
        } catch (error: unknown) {
          const satitizedErrors = (error as ValidationError[]).map((err) => ({
            field: err.property,
            constraints: Object.values(err.constraints || {}),
          }));

          throw new AppException({ message: 'Invalid response shape', error: satitizedErrors }, HttpStatus.INTERNAL_SERVER_ERROR, {
            cause: error,
            description: 'ResponseValidationInterceptor',
          });
        }

        return data;
      })
    );
  }
}
