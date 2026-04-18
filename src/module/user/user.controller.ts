import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';

import { CurrentUserDecorator } from '../../decorator/currentUser.decorator.js';
import { RoleDecorator } from '../../decorator/role.decorator.js';
import { AuthGuard } from '../../guard/auth.guard.js';
import { RoleGuard } from '../../guard/role.guard.js';
import { RoleEnum } from '../../model/user.model.js';
import { AppResponseDto } from '../../type/appResponse.dto.js';
import { UserLeanType } from '../../type/userLean.type.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getProfile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RoleGuard)
  @RoleDecorator([RoleEnum.USER])
  async getProfile(@CurrentUserDecorator() user: UserLeanType): Promise<AppResponseDto> {
    return await this.userService.getProfile(user);
  }
}
