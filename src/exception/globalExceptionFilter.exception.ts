/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

import { appConfig } from '../config/appConfig.js';
import { TAppEnv } from '../type/appEnv.type.js';
import { AppException } from './appException.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('[GlobalExceptionFilter]: ', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AppException) {
      return response.status(exception.getStatus()).json({
        success: false,
        statusCode: exception.getStatus(),
        message: exception.message,
        error: (exception.getResponse() as { message: string; error: unknown }).error,
        errorCause: appConfig.app.APP_ENV !== TAppEnv.PROD ? exception.cause : undefined,
      });
    }

    if (exception instanceof NotFoundException) {
      return response.status(HttpStatus.NOT_FOUND).json({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: (exception.getResponse() as { message: string; error: unknown }).error,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown internal server error occurred',
      error: {},
    });
  }
}
