import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error.constant';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { traceId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as any;
      const exceptionMessage =
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message || exceptionResponse
          : exceptionResponse;

      const actualMessage = Array.isArray(exceptionMessage)
        ? exceptionMessage[0]
        : exceptionMessage;

      // Mặc định details sẽ là một Object để FE luôn xử lý đồng nhất
      details =
        typeof exceptionMessage === 'object'
          ? exceptionMessage
          : { message: exceptionMessage };

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          code = ERROR_CODES.VALIDATION_FAILED;
          message = ERROR_MESSAGES.VALIDATION_FAILED;
          // Đối với Validation, details đã là Mapping Object từ exceptionFactory
          break;
        case HttpStatus.UNAUTHORIZED:
          code = ERROR_CODES.UNAUTHORIZED;
          message = exceptionMessage || ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          code =
            actualMessage === 'Tài khoản của bạn đã bị khóa bởi quản trị viên.'
              ? ERROR_CODES.ACCOUNT_BANNED
              : ERROR_CODES.FORBIDDEN;
          message = exceptionMessage || ERROR_MESSAGES.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          code = ERROR_CODES.NOT_FOUND;
          message = exceptionMessage || ERROR_MESSAGES.NOT_FOUND;
          break;
        case HttpStatus.CONFLICT:
          code = ERROR_CODES.CONFLICT;
          message = exceptionMessage || ERROR_MESSAGES.CONFLICT;
          break;
        default:
          message = exceptionMessage || exception.message;
      }
    } else {
      // Log generic error here if needed
      console.error(exception);
    }

    response.status(status).json({
      data: null,
      meta: null,
      error: {
        code,
        message,
        traceId: request.traceId || null,
        details: details || null,
      },
    });
  }
}
