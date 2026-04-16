import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EmailLibModule } from '../../lib/email.lib.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthJwtService } from './authJwt.service.js';

@Module({
  imports: [JwtModule.register({}), EmailLibModule],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService],
})
export class AuthModule {}
