import { HttpStatus, Injectable } from '@nestjs/common';

import { AppResponse } from '../../lib/appResponse.lib.js';

@Injectable()
export class HealthService {
  async getHealth(): Promise<AppResponse> {
    return { success: true, statusCode: HttpStatus.OK, message: 'API is healthy', data: {} };
  }
}
