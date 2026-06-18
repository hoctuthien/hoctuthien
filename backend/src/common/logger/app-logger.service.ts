import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { correlationIdStorage } from './correlation-id.context';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  private buildLogPayload(message: any, context?: string): any {
    const store = correlationIdStorage.getStore();
    const correlationId = store?.correlationId || null;

    const isProduction = process.env.NODE_ENV === 'production';

    // Xử lý dữ liệu đầu vào.
    // Nếu là object -> có struct. Nếu không phải object -> message thường.
    let logObject: any = {
      correlationId,
      context: context || this.context,
    };

    if (typeof message === 'object' && message !== null) {
      logObject = { ...logObject, ...message };
      // Nếu message là Error
      if (message instanceof Error) {
        logObject.message = message.message;
        logObject.stack = message.stack;
      } else if (!logObject.message) {
        // Nếu truyền object mà không có message
        logObject.message = 'Structured log payload';
      }
    } else {
      logObject.message = message;
    }

    // Ở môi trường production, in dạng JSON thô (không màu)
    if (isProduction) {
      return logObject;
    }

    // Ở môi trường Dev, in dạng text có đính kèm correlationId để dễ đọc
    const cidStr = correlationId ? `[${correlationId}] ` : '';
    let textMessage = logObject.message;

    // Loại bỏ các property đã in ra thành string để in phần còn lại của object
    const { correlationId: _, context: __, message: ___, ...rest } = logObject;
    if (Object.keys(rest).length > 0) {
      textMessage += ` ${JSON.stringify(rest)}`;
    }

    return `${cidStr}${textMessage}`;
  }

  log(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          level: 'info',
          ...this.buildLogPayload(message, context),
        }),
      );
    } else {
      super.log(this.buildLogPayload(message, context), context);
    }
  }

  error(message: any, stack?: string, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      const formatted = this.buildLogPayload(message, context);
      formatted.stack = stack || formatted.stack;
      console.error(JSON.stringify({ level: 'error', ...formatted }));
    } else {
      super.error(this.buildLogPayload(message, context), stack, context);
    }
  }

  warn(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        JSON.stringify({
          level: 'warn',
          ...this.buildLogPayload(message, context),
        }),
      );
    } else {
      super.warn(this.buildLogPayload(message, context), context);
    }
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          ...this.buildLogPayload(message, context),
        }),
      );
    } else {
      super.debug(this.buildLogPayload(message, context), context);
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          level: 'verbose',
          ...this.buildLogPayload(message, context),
        }),
      );
    } else {
      super.verbose(this.buildLogPayload(message, context), context);
    }
  }
}
