import { HttpStatus, Injectable } from '@nestjs/common';

import { AppResponseDto } from '../../type/appResponse.dto.js';

@Injectable()
export class HealthService {
  async getHealth(): Promise<AppResponseDto> {
    return { success: true, statusCode: HttpStatus.OK, message: 'API is healthy', data: {} };
  }
}
