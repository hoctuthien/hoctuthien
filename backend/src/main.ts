<<<<<<< HEAD
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector, NestFactory } from '@nestjs/core';
=======
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
>>>>>>> ce598f2d495d7208aed91c602bc63b5453fe71f4
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const port = configService.get<number>('port') || 5050; 

  // Loại trừ route "/" khỏi Prefix
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''), {
    exclude: ['/'],
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Tự động xóa các trường không có trong DTO
  //     forbidNonWhitelisted: true, // Trả về lỗi 400 nếu có trường lạ
  //     transform: true, // Cực kỳ quan trọng
  //     transformOptions: {
  //       enableImplicitConversion: true, // Tự động convert kiểu dữ liệu
  //     },
  //   }),
  // );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseTransformInterceptor(reflector),
=======
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
>>>>>>> ce598f2d495d7208aed91c602bc63b5453fe71f4
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
