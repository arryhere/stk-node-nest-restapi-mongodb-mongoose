/**
 * if PublicDecorator(true); publicRoute is true
 * if PublicDecorator(false); publicRoute is false
 * if PublicDecorator(); publicRoute is {}
 * if PublicDecorator not used in route handler; publicRoute is undefined
 *
 * here; const publicRoute = this.reflector.get(PublicDecorator, context.getHandler());
 */

import { Reflector } from '@nestjs/core';

export const PublicDecorator = Reflector.createDecorator<boolean>();
