import { Controller, Get } from '@nestjs/common';

import { PublicDecorator } from '../../decorator/public.decorator.js';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @PublicDecorator(true)
  @Get()
  async getHealth() {
    return await this.healthService.getHealth();
  }
}
