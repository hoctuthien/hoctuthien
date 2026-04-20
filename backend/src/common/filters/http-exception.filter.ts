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
      
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          code = ERROR_CODES.VALIDATION_FAILED;
          message = ERROR_MESSAGES.VALIDATION_FAILED;
          // Thông thường ở NestJS, ValidationPipe sẽ trả về mảng các thông báo lỗi trong thuộc tính 'message'
          details = typeof exceptionResponse === 'object' ? exceptionResponse.message : exceptionResponse;
          break;
        case HttpStatus.UNAUTHORIZED:
          code = ERROR_CODES.UNAUTHORIZED;
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          code = ERROR_CODES.FORBIDDEN;
          message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          code = ERROR_CODES.NOT_FOUND;
          message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case HttpStatus.CONFLICT:
          code = ERROR_CODES.CONFLICT;
          message = ERROR_MESSAGES.CONFLICT;
          break;
        default:
          message = typeof exceptionResponse === 'object' && exceptionResponse.message 
            ? exceptionResponse.message 
            : exception.message;
      }
    } else {
      // Log generic error here if needed
      console.error(exception);
    }

    response.status(status).json({
      error: {
        code,
        message,
        traceId: request.traceId || null,
        details,
      },
    });
  }
}
