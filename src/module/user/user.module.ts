import { Module } from '@nestjs/common';

import { JwtLibModule } from '../../lib/jwt.lib.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';

@Module({
  imports: [JwtLibModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
