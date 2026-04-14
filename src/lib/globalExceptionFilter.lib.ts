/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.error('[GlobalExceptionFilter]: ', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.name === 'AppException') {
      return response.status(exception.getStatus()).json({
        success: false,
        statusCode: exception.getStatus(),
        message: exception.message,
        error: exception.getResponse().error,
      });
    }

    if (exception.name === 'NotFoundException') {
      return response.status(HttpStatus.NOT_FOUND).json({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: exception.getResponse().error,
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
