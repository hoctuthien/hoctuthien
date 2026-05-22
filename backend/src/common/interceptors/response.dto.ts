import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ApiErrorDto {
  @ApiProperty({ example: 'INTERNAL_SERVER_ERROR' })
  code: string;

  @ApiProperty({ example: 'An unexpected error occurred' })
  message: string;

  @ApiProperty({ required: false, example: 'uuid-trace-id' })
  traceId?: string;

  @ApiProperty({ required: false })
  details?: any;
}

export class ApiResponseDto<T = any> {
  @ApiProperty()
  data: T | null;

  @ApiProperty({ type: PaginationMetaDto, required: false })
  meta: PaginationMetaDto | Record<string, any> | null;

  @ApiProperty({ type: ApiErrorDto, required: false, nullable: true })
  error: ApiErrorDto | null;
}
