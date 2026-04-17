import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const port = configService.get<number>('port') || 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động xóa các trường không có trong DTO
      forbidNonWhitelisted: true, // Trả về lỗi 400 nếu có trường lạ
      transform: true, // Cực kỳ quan trọng
      transformOptions: {
        enableImplicitConversion: true, // Tự động convert kiểu dữ liệu
      },
    }),
  );
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseTransformInterceptor(),
  );
  await app.listen(port);

  console.log(
    `Server running at http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`,
  );
}

bootstrap();
