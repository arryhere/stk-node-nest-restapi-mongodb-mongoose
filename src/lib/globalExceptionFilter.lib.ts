/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

import { AppException } from './appException.lib.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // console.error('[GlobalExceptionFilter]: ', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AppException) {
      return response.status(exception.getStatus()).json({
        success: false,
        statusCode: exception.getStatus(),
        message: exception.message,
        error: (exception.getResponse() as { message: string; error: unknown }).error,
      });
    }

    if (exception instanceof NotFoundException) {
      console.log(exception.getResponse())
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
