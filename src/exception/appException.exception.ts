import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(response: { message: string; error: unknown }, status: HttpStatus, options: { cause?: unknown; description?: string }) {
    super(response, status, options);
  }
}
