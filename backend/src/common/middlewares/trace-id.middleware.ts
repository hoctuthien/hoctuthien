import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request & { traceId?: string }, _res: Response, next: NextFunction) {
    req.traceId = (req.headers['x-trace-id'] as string) ?? `req-${randomUUID()}`;
    next();
  }
}
