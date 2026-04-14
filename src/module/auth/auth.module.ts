import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthJwtService } from './authJwt.service.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService],
})
export class AuthModule {}
