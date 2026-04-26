import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { appConfig } from '../config/appConfig.js';
import { AppException } from '../exception/appException.exception.js';
import { AppResponseDto } from '../type/appResponse.dto.js';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor() {}

  private readonly TIMEOUT_MS = appConfig.app.APP_RESPONSE_TIMEOUT;

  async intercept(context: ExecutionContext, next: CallHandler<AppResponseDto>): Promise<Observable<AppResponseDto>> {
    return next.handle().pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          throw new AppException(
            { message: `Request timed out after ${this.TIMEOUT_MS / 1000} s`, error: {} },
            HttpStatus.REQUEST_TIMEOUT,
            { cause: error, description: 'TimeoutInterceptor' }
          );
        }
        return throwError(() => error);
      })
    );
  }
}
