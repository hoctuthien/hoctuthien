import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import {
  RATE_LIMIT_FAIL_KEY,
  RateLimitFailOptions,
} from '../decorators/rate-limit-fail.decorator';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';

@Injectable()
export class RateLimitFailInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const options = this.reflector.get<RateLimitFailOptions>(
      RATE_LIMIT_FAIL_KEY,
      handler,
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);

    const blockKey = `rate_limit:block:${options.type}:${ip}`;
    const failKey = `rate_limit:fail:${options.type}:${ip}`;

    // Pre-handler: Check if the IP is blocked
    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked) {
      const ttl = await this.redis.ttl(blockKey);
      const waitTime = ttl > 0 ? ttl : options.blockDuration;
      throw new HttpException(
        `Bạn đã thử thất bại quá nhiều lần. Vui lòng thử lại sau ${waitTime} giây.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle().pipe(
      // On success: Clear failure count
      tap(() => {
        this.redis.del(failKey).catch((err) => {
          console.error(
            `[RateLimitFailInterceptor] Error deleting fail key:`,
            err,
          );
        });
      }),
      // On failure: Handle counting and blocking
      catchError((error) => {
        // If already a 429 error, just propagate it
        if (
          error instanceof HttpException &&
          error.getStatus() === HttpStatus.TOO_MANY_REQUESTS
        ) {
          return throwError(() => error);
        }

        const handleFailurePromise = (async () => {
          try {
            const currentFails = await this.redis.incr(failKey);
            if (currentFails === 1) {
              await this.redis.expire(failKey, options.ttl);
            }

            if (currentFails >= options.limit) {
              await this.redis.set(blockKey, '1', 'EX', options.blockDuration);
              await this.redis.del(failKey);
            }
          } catch (redisError) {
            console.error(
              `[RateLimitFailInterceptor] Redis tracking error:`,
              redisError,
            );
          }
        })();

        // Resolve the async operation, then propagate the original error
        return from(handleFailurePromise).pipe(
          mergeMap(() => throwError(() => error)),
        );
      }),
    );
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      request.connection?.remoteAddress ||
      '127.0.0.1'
    );
  }
}
