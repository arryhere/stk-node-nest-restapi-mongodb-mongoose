import { Module } from '@nestjs/common';

import { CryptographyLibModule } from '../../lib/cryptography.lib.js';
import { EmailLibModule } from '../../lib/email.lib.js';
import { JwtLibModule } from '../../lib/jwt.lib.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [JwtLibModule, EmailLibModule, CryptographyLibModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
