import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }
    try {
      // Parse dữ liệu dựa trên schema truyền vào
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: any) {
      // lỗi, ném ra 400
      throw new BadRequestException({
        message: 'Dữ liệu xác thực không hợp lệ',
        errors: error.errors,
      });
    }
  }
}
