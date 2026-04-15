import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { DtoSignupInput } from './dto/signup.input.dto.js';
import { DtoVerifyInput } from './dto/verify.input.dto.js';
import { DtoVerifyLinkInput } from './dto/verifyLink.input.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dtoSignupInput: DtoSignupInput) {
    return await this.authService.signup(dtoSignupInput);
  }

  @Get('verifyLink')
  @HttpCode(HttpStatus.OK)
  async verifyLink(@Body() dtoVerifyLinkInput: DtoVerifyLinkInput) {
    return await this.authService.verifyLink(dtoVerifyLinkInput);
  }

  @Patch('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dtoVerifyInput: DtoVerifyInput) {
    return await this.authService.verify(dtoVerifyInput);
  }
}
