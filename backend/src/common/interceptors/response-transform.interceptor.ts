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
    if (context.getType<string>() === 'graphql') {
      return next.handle();
    }

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
      map((data) => {
        // Nếu data đã theo chuẩn pagination (có items/data và meta)
        if (data && typeof data === 'object' && 'meta' in data) {
          const items =
            'items' in data ? data.items : 'data' in data ? data.data : [];
          return {
            data: Array.isArray(items)
              ? items
              : items !== undefined && items !== null
                ? [items]
                : [],
            message: (data as any).message || '',
            meta: data.meta || {},
          };
        }

        // Nếu data có cấu trúc message hoặc data
        if (
          data &&
          typeof data === 'object' &&
          ('message' in data || 'data' in data)
        ) {
          const resData = 'data' in data ? data.data : data;
          const resMsg = 'message' in data ? data.message : '';
          const resMeta = 'meta' in data ? data.meta : {};
          return {
            data: Array.isArray(resData)
              ? resData
              : resData !== undefined && resData !== null
                ? [resData]
                : [],
            message: resMsg || '',
            meta: resMeta || {},
          };
        }

        // Trường hợp data thông thường
        return {
          data: Array.isArray(data)
            ? data
            : data !== undefined && data !== null
              ? [data]
              : [],
          message: '',
          meta: {},
        };
      }),
    );
  }
}
