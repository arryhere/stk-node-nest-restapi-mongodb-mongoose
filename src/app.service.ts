import { Injectable } from '@nestjs/common';

import { AppResponseDto } from './type/appResponse.dto.js';

@Injectable()
export class AppService {
  async getBase(): Promise<AppResponseDto> {
    return { success: true, statusCode: 200, message: 'Base endpoint', data: {} };
  }
}
