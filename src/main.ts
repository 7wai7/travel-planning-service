import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableShutdownHooks();
  app.enableCors({
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // видалити зайві поля
      forbidNonWhitelisted: false, // не кидати помилку при зайвих полях
      transform: true, // автоматично трансформувати до типів DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
