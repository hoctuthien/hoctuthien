import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
// This interceptor normalizes server responses.
// It keeps JSON API responses consistent across the backend.
// If a controller already returns { success, data }, it will keep that shape.
// Otherwise, it wraps the raw payload into { success: true, data }.
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Skip wrapping when the handler already returns the standard response shape.
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          return data;
        }

        // Wrap plain payloads so the frontend always receives a predictable response.
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
