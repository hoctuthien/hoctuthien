export class BaseResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
}
