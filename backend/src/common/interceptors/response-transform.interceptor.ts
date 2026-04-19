import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IS_BYPASS_KEY } from '../decorators/bypass-interceptor.decorator';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {} // Nhớ inject Reflector vào nhé

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. Kiểm tra xem hàm đang chạy có dán nhãn Bypass không
    const isBypass = this.reflector.getAllAndOverride<boolean>(IS_BYPASS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Nếu có nhãn Bypass, trả dữ liệu nguyên bản, không bọc JSON nữa
    if (isBypass) {
      return next.handle();
    }

    // 3. Nếu không có nhãn, vẫn bọc JSON như cũ
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
