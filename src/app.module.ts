import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { appConfig } from './config/appConfig.js';
import { LoggerMiddleware } from './middleware/logger.middleware.js';
import { TokenModelModule } from './model/token.model.js';
import { UserModelModule } from './model/user.model.js';
import { AuthModule } from './module/auth/auth.module.js';
import { HealthModule } from './module/health/health.module.js';
import { UserModule } from './module/user/user.module.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({ useFactory: () => ({ uri: appConfig.mongodb.MONGODB_URI }) }),

    UserModelModule,
    TokenModelModule,

    HealthModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
