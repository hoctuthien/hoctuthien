import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      // Parse dữ liệu dựa trên schema truyền vào
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      // lỗi, ném ra 400
      throw new BadRequestException({
        message: 'Dữ liệu xác thực không hợp lệ',
        errors: error.errors,
      });
    }
  }
}
