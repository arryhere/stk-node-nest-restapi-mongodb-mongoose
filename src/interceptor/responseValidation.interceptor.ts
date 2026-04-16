// validation pipe will not catch it as pipes works on requests only and not responses; hence we are using interceptor (can work for both request and response) to validate the response before sending it to the client)
import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { Observable, switchMap } from 'rxjs';

import { AppException } from '../exception/appException.exception.js';
import { TAppResponse } from '../type/appResponse.type.js';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<TAppResponse>): Observable<TAppResponse> {
    // const ctx = context.switchToHttp();
    // const request = ctx.getRequest();
    // const response = ctx.getResponse();

    return next.handle().pipe(
      switchMap(async (data) => {
        const response = plainToInstance(TAppResponse, data);

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
