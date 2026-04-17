export class BaseResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  pagination: PaginationMetaDto;
}
