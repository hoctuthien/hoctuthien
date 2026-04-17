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
  const port = configService.get<number>('port') || 3000;

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
