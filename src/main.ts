import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalResponseInterceptor } from './common/interceptors/global-response.interceptor';
import { CustomValidationPipe } from './utils/CustomValidationPipe';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import {  Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'verbose', 'warn'],
  });

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new CustomValidationPipe());

  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Leyu API')
    .setDescription('Leyu Api documentation')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth() // Ensure BearerAuth is added
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.servers = [{ url: '/api' }];
  SwaggerModule.setup('doc', app, document);
  // writeFileSync('../swagger-spec.json', JSON.stringify(document));
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  const environment = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT');
  app.enableCors({
    origin: corsOrigin,
  }); //  This allows all origins by default
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.setGlobalPrefix('api');


  // Create your queues
  const myQueue = new Queue('file-upload', {
    connection: {
      host:  configService.get<string>('REDIS_HOST'), 
      port: Number(configService.get<string>('REDIS_PORT') || '6379'),
    },
  });

  // Create Bull Board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(myQueue)],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
  
  Logger.log(`🚀 Leyu Api  is running on port ${port}`);
  Logger.log(`📦 Environment: ${environment}`);
  Logger.log(`🌐 CORS enabled for origin: ${corsOrigin}`);
  Logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  Logger.log(`💾 Database: ${configService.get<string>('DATABASE_URL')}`);
  Logger.log(`📦 Redis: ${configService.get<string>('REDIS_URL')}`);
  Logger.log(`📦 RabbitMQ: ${configService.get<string>('RABBITMQ_URI')}`);
  Logger.log(`📦 Minio: ${configService.get<string>('MINIO_ENDPOINT')}`);

}
bootstrap();
