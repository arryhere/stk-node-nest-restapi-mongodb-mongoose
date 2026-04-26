import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { CurrentUserDecorator } from '../../decorator/currentUser.decorator.js';
import { RoleDecorator } from '../../decorator/role.decorator.js';
import { RoleEnum } from '../../model/user.model.js';
import { AppResponseDto } from '../../type/appResponse.dto.js';
import { CurrentUserType } from '../../type/currentUser.type.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getProfile')
  @HttpCode(HttpStatus.OK)
  @RoleDecorator([RoleEnum.ADMIN])
  async getProfile(@CurrentUserDecorator() user: CurrentUserType): Promise<AppResponseDto> {
    return await this.userService.getProfile(user);
  }
}
