import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { SigninInputDto } from './dto/signin.input.dto.js';
import { SignupInputDto } from './dto/signup.input.dto.js';
import { VerifyInputDto } from './dto/verify.input.dto.js';
import { VerifyLinkInputDto } from './dto/verifyLink.input.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupInputDto: SignupInputDto) {
    return await this.authService.signup(signupInputDto);
  }

  @Get('verifyLink')
  @HttpCode(HttpStatus.OK)
  async verifyLink(@Body() verifyLinkInputDto: VerifyLinkInputDto) {
    return await this.authService.verifyLink(verifyLinkInputDto);
  }

  @Patch('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyInputDto: VerifyInputDto) {
    return await this.authService.verify(verifyInputDto);
  }

  @Get('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinInputDto: SigninInputDto) {
    return await this.authService.signin(signinInputDto);
  }
}
