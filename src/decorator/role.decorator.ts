import { Reflector } from '@nestjs/core';

export const RoleDecorator = Reflector.createDecorator<string[]>();
