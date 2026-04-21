export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponseDto<T = any> {
  data: T | null;
  meta: PaginationMetaDto | Record<string, any> | null;
  error: ApiErrorDto | null;
}

export interface ApiErrorDto {
  code: string;
  message: string;
  traceId?: string;
  details?: any;
}
