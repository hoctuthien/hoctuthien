import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const port = configService.get<number>('port') || 3000;

  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));
  await app.listen(port);

  console.log(`Server running at http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
}

bootstrap();
