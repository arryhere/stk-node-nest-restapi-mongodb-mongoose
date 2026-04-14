import { Injectable } from '@nestjs/common';

import { AppResponse } from './lib/appResponse.lib.js';

@Injectable()
export class AppService {
  async getBase(): Promise<AppResponse> {
    return { success: true, statusCode: 200, message: 'Base endpoint', data: {} };
  }
}
