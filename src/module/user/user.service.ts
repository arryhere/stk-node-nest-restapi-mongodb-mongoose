import { Injectable } from '@nestjs/common';

import { AppResponseDto } from '../../type/appResponse.dto.js';
import { UserLeanType } from '../../type/userLean.type.js';

@Injectable()
export class UserService {
  async getProfile(user: UserLeanType): Promise<AppResponseDto> {
    return {
      success: true,
      message: 'Profile fetched successfully',
      statusCode: 200,
      data: user,
    };
  }
}
