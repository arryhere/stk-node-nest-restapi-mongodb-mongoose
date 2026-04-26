import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { appConfig } from './config/appConfig.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
