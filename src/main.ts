import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { kafkaServerConfig } from './kafka/kafka-server.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Entry point of the application.
 * Sets up Swagger, global validation, CORS and Kafka microservice.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/users');

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup with JWT support
  const config = new DocumentBuilder()
    .setTitle('Create User Microservice')
    .setDescription('Handles creation of users. Requires admin role and JWT.')
    .setVersion('1.0')
    .addBearerAuth() // Enables the "Authorize" button
    .addTag('Users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>(kafkaServerConfig);
  await app.startAllMicroservices();

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
