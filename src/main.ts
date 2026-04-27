import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { appConfig } from './config/appConfig.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3003'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // which request headers the browser is allowed to send
    exposedHeaders: ['Content-Length'], // which response headers JavaScript can read in the browser
    credentials: true, // allow cookies/auth headers; When credentials: true, origin: ['*'] is not allowed — you must specify exact origins
    maxAge: 86400, // 86400 seconds = 24 hours; tells the browser to cache the preflight response for 24 hours
  });

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
