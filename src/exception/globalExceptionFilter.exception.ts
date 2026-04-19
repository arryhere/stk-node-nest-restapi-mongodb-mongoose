/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

import { appConfig } from '../config/appConfig.js';
import { AppEnvEnum } from '../type/appEnv.enum.js';
import { AppException } from './appException.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AppException) {
      return response.status(exception.getStatus()).json({
        success: false,
        statusCode: exception.getStatus(),
        message: exception.message,
        error: (exception.getResponse() as { message: string; error: unknown }).error,
        errorCause: appConfig.app.APP_ENV !== AppEnvEnum.PROD ? exception.cause : undefined,
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
