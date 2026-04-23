import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ limit: '5mb', extended: true }));

  // 🔥 ACTIVAR CORS
  app.enableCors({
    origin: '*', // permitir Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    //forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = parseInt(process.env.PORT ?? '3000', 10) || 3000;
  await app.listen(port);
  console.log(`API escuchando en el puerto ${port} (prefijo /api)`);
}
bootstrap();
