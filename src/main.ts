import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { appConfig } from './config/appConfig.js';
import { AppException } from './exception/appException.exception.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const satitizedErrors = errors.map((err) => ({ field: err.property, constraints: Object.values(err.constraints || {}) }));
        return new AppException({ message: 'Validation Failed', error: satitizedErrors }, HttpStatus.BAD_REQUEST, {
          cause: errors,
          description: 'ValidationPipe',
        });
      },
    })
  );

  if (appConfig.app.APP_ENV !== 'prod') {
    const swagger = new DocumentBuilder()
      .setTitle('Node Nest')
      .setDescription('Rest Api Server built using - Node.js, Nest.js')
      .setVersion('v1')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(appConfig.app.APP_PORT, () => {
    console.log(`server running at: 🚀 http://localhost:${appConfig.app.APP_PORT} 🚀`);
  });
}

void bootstrap();
