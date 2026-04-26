// decorator/public.decorator.ts
import { Reflector } from '@nestjs/core';

export const PublicDecorator = Reflector.createDecorator<boolean>();
