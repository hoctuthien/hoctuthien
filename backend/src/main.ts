import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const prefix = config.get('apiPrefix') || 'api/v1';
  app.setGlobalPrefix(prefix.replace(/^\//, ''), { exclude: ['/'] });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formatError = (errorList: any[]) => {
          return errorList.reduce((acc, error) => {
            if (error.children && error.children.length > 0) {
              acc[error.property] = formatError(error.children);
            } else {
              // Tự động hóa thông báo lỗi "không được để trống"
              const constraints = error.constraints || {};
              if (constraints.isNotEmpty) {
                acc[error.property] = `${error.property} không được để trống`;
              } else {
                acc[error.property] = Object.values(constraints)[0];
              }
            }
            return acc;
          }, {});
        };
        return new BadRequestException(formatError(errors));
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(config.get('port') || 5050);
}
bootstrap();
