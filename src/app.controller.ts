import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service.js';
import { PublicDecorator } from './decorator/public.decorator.js';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicDecorator(true)
  @Get()
  async getBase() {
    return await this.appService.getBase();
  }
}
