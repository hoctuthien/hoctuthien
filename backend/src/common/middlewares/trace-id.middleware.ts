import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request & { traceId?: string }, res: Response, next: NextFunction) {
    const traceId =
      (req.headers['x-trace-id'] as string) ?? `req-${randomUUID()}`;
    req.traceId = traceId;

    // Log Request
    const { method, originalUrl, body } = req;
    console.log(`\n============== [REQUEST] [${traceId}] ==============`);
    console.log(`${method} ${originalUrl}`);
    if (body && Object.keys(body).length > 0) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
    console.log(`====================================================\n`);

    // Intercept Response to log it
    const originalJson = res.json;
    res.json = function (jsonBody: any) {
      console.log(`\n============== [RESPONSE] [${traceId}] ==============`);
      console.log(`Status: ${res.statusCode} ${method} ${originalUrl}`);
      console.log('Data:', JSON.stringify(jsonBody, null, 2));
      console.log(`=====================================================\n`);
      return originalJson.call(this, jsonBody);
    };

    next();
  }
}
