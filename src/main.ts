import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './exceptionFilters/httpexception.filter';
import { AllExceptionsFilter } from './exceptionFilters/allException.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
    app.useGlobalPipes( new ValidationPipe({ whitelist: true,forbidNonWhitelisted: true, transform: true}))
    app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter())
    app.use(cookieParser())
   
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, 
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
