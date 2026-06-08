import { SetMetadata } from '@nestjs/common';

export interface RateLimitFailOptions {
  type: string;          // E.g., 'login' | 'register'
  limit: number;         // Maximum allowed failures
  ttl: number;           // Track duration in seconds (e.g., 60)
  blockDuration: number; // Block duration in seconds (e.g., 60)
}

export const RATE_LIMIT_FAIL_KEY = 'rate_limit_fail';

export const RateLimitFail = (options: RateLimitFailOptions) =>
  SetMetadata(RATE_LIMIT_FAIL_KEY, options);
