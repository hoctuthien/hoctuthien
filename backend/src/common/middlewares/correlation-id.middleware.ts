import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { correlationIdStorage } from '../logger/correlation-id.context';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(CorrelationIdMiddleware.name);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-trace-id'] as string) ||
      `req-${randomUUID()}`;

    // Set header cho response để client thấy
    res.setHeader('X-Correlation-Id', correlationId);

    // Bọc toàn bộ quá trình xử lý request vào AsyncLocalStorage
    correlationIdStorage.run({ correlationId }, () => {
      // Log Request dạng cấu trúc
      const { method, originalUrl } = req;
      this.logger.log({ method, url: originalUrl }, '[REQUEST]');

      // Intercept Response để log kết quả
      const originalJson = res.json;
      res.json = function (jsonBody: any) {
        // Khôi phục context cho logger trong lúc intercept
        correlationIdStorage.run({ correlationId }, () => {
          // Lấy custom logger để gọi (do this context bị đổi bên trong function)
          const localLogger = new AppLogger();
          localLogger.setContext(CorrelationIdMiddleware.name);
          localLogger.log(
            { statusCode: res.statusCode, method, url: originalUrl },
            '[RESPONSE]',
          );
        });

        return originalJson.call(this, jsonBody);
      };

      next();
    });
  }
}
