import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import { AppLogger } from './common/logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const appLogger = await app.resolve(AppLogger);
  app.useLogger(appLogger);

  const config = app.get(ConfigService);
  const logLevel = config.get('logLevel') || 'info';

  if (logLevel !== 'info') {
    appLogger.log(`Setting log level to ${logLevel}`, 'Bootstrap');
    // Simplified logic: NestJS doesn't natively allow changing levels dynamically at runtime for ConsoleLogger
    // without passing array of log levels, so we rely on custom logger logic if needed.
  }

  const reflector = app.get(Reflector);

  // 1. Bảo mật Header với Helmet
  app.use(helmet());

  // 2. Chống tấn công XSS (lọc mã độc trong body, query, params)
  app.use(xss());

  // 3. Cấu hình CORS
  app.enableCors({
    origin: true, // Cho phép tất cả các domain trong quá trình dev
    credentials: true, // Cho phép gửi cookie
  });

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hoctuthien API')
    .setDescription('Auto-generated API documentation for all controllers')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = config.get('port') || 5050;
  await app.listen(port);
  appLogger.log(
    `🚀 Application is running on: http://localhost:${port}/${prefix}`,
    'Bootstrap'
  );
  appLogger.log(`👨‍ quản trị hệ thống tại: http://localhost:${port}/admin`, 'Bootstrap');
}
bootstrap();
// test develop
