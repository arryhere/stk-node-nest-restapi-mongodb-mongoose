import { Injectable } from '@nestjs/common';

import { TAppResponse } from './type/appResponse.type.js';

@Injectable()
export class AppService {
  async getBase(): Promise<TAppResponse> {
    return { success: true, statusCode: 200, message: 'Base endpoint', data: {} };
  }
}
