import { Injectable } from '@nestjs/common';

import { AppResponseDto } from '../../type/appResponse.dto.js';
import { CurrentUserType } from '../../type/currentUser.type.js';

@Injectable()
export class UserService {
  async getProfile(user: CurrentUserType): Promise<AppResponseDto> {
    return {
      success: true,
      message: 'Profile fetched successfully',
      statusCode: 200,
      data: user,
    };
  }
}
