import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guard/auth.guard.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getProfile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getProfile() {
    return await this.userService.getProfile();
  }
}
