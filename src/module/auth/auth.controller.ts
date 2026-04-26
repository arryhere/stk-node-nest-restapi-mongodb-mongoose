import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';

import { PublicDecorator } from '../../decorator/public.decorator.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenInputDto } from './dto/refreshToken.input.dto.js';
import { SigninInputDto } from './dto/signin.input.dto.js';
import { SignupInputDto } from './dto/signup.input.dto.js';
import { VerifyInputDto } from './dto/verify.input.dto.js';
import { VerifyLinkInputDto } from './dto/verifyLink.input.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicDecorator(true)
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupInputDto: SignupInputDto) {
    return await this.authService.signup(signupInputDto);
  }

  @PublicDecorator(true)
  @Get('verifyLink')
  @HttpCode(HttpStatus.OK)
  async verifyLink(@Body() verifyLinkInputDto: VerifyLinkInputDto) {
    return await this.authService.verifyLink(verifyLinkInputDto);
  }

  @PublicDecorator(true)
  @Patch('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyInputDto: VerifyInputDto) {
    return await this.authService.verify(verifyInputDto);
  }

  @PublicDecorator(true)
  @Get('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinInputDto: SigninInputDto) {
    return await this.authService.signin(signinInputDto);
  }

  @PublicDecorator(true)
  @Get('refreshToken')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Query() refreshTokenInputDto: RefreshTokenInputDto) {
    return await this.authService.refreshToken(refreshTokenInputDto);
  }
}
