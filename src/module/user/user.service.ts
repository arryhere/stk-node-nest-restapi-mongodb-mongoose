import { Injectable } from '@nestjs/common';

import { TAppResponse } from '../../type/appResponse.type.js';

@Injectable()
export class UserService {
  async getProfile(): Promise<TAppResponse> {
    return {
      success: true,
      message: 'Profile fetched successfully',
      statusCode: 200,
      data: {},
    };
  }
}
