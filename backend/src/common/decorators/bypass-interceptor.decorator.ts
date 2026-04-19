import { SetMetadata } from '@nestjs/common';

// Đặt một cái tên định danh cho nhãn này
export const IS_BYPASS_KEY = 'isBypass';
export const BypassInterceptor = () => SetMetadata(IS_BYPASS_KEY, true);
