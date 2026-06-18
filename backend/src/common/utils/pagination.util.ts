import { z } from 'zod';

/**
 * Zod schema validation dùng chung cho phân trang toàn hệ thống
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Cấu trúc phản hồi phân trang chuẩn
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Helper tạo metadata phân trang chuẩn hóa
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
