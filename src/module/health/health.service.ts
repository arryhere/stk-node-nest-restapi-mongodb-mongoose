import { HttpStatus, Injectable } from '@nestjs/common';

import { TAppResponse } from '../../type/appResponse.type.js';

@Injectable()
export class HealthService {
  async getHealth(): Promise<TAppResponse> {
    return { success: true, statusCode: HttpStatus.OK, message: 'API is healthy', data: {} };
  }
}
