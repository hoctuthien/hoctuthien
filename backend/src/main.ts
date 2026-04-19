import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const port = configService.get<number>('port') || 5050; 

  // Loại trừ route "/" khỏi Prefix
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''), {
    exclude: ['/'],
  });

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseTransformInterceptor(reflector),
  );

  // Lắng nghe trên 0.0.0.0 để Coolify có thể map vào container
  await app.listen(process.env.PORT || 5050, '0.0.0.0');

  console.log(
    `Server running at http://localhost:${process.env.PORT || 5050}/${apiPrefix.replace(/^\//, '')}`,
  );
}

bootstrap();
