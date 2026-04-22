import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import { SET_COOKIE_KEY, SetCookieOptions } from '../decorators/set-cookie.decorator';

@Injectable()
export class SetCookieInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const optionsList = this.reflector.get<SetCookieOptions[]>(
      SET_COOKIE_KEY,
      context.getHandler(),
    );

    if (!optionsList || !Array.isArray(optionsList)) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((data) => {
        optionsList.forEach((options) => {
          if (data && data[options.field]) {
            const cookieValue = data[options.field];
            const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              ...options.options,
            };

            response.cookie(options.name, cookieValue, cookieOptions);
          }
        });
      }),
    );
  }
}
