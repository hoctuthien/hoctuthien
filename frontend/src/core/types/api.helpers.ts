/**
 * API Type Helpers
 *
 * Utility types để truy cập types từ OpenAPI generated file dễ dàng hơn.
 *
 * Cách dùng:
 *   1. Chạy backend: `cd backend && npm run dev`
 *   2. Generate types: `cd frontend && npm run gen:api`
 *   3. Import types:
 *
 *      import type { ApiSchemas, ApiPaths } from '@/core/types/api.helpers';
 *
 *      // Lấy request body type
 *      type LoginBody = ApiRequestBody<'/api/v1/auths/login', 'post'>;
 *
 *      // Lấy response type
 *      type LoginResponse = ApiResponse<'/api/v1/auths/login', 'post'>;
 */

import type { paths, components } from './api.generated';

// ============================================================
// Quick access to schema types (nếu backend có named schemas)
// ============================================================
export type ApiSchemas = components['schemas'];

// ============================================================
// Quick access to path types
// ============================================================
export type ApiPaths = paths;

// ============================================================
// Helper: Lấy response body type từ một endpoint
// ============================================================
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type ApiResponse<
  Path extends keyof paths,
  Method extends HttpMethod & keyof paths[Path],
> = paths[Path][Method] extends {
  responses: {
    200: { content: { 'application/json': infer R } };
  };
}
  ? R
  : paths[Path][Method] extends {
        responses: {
          201: { content: { 'application/json': infer R } };
        };
      }
    ? R
    : never;

// ============================================================
// Helper: Lấy request body type từ một endpoint
// ============================================================
export type ApiRequestBody<
  Path extends keyof paths,
  Method extends HttpMethod & keyof paths[Path],
> = paths[Path][Method] extends {
  requestBody: { content: { 'application/json': infer B } };
}
  ? B
  : never;

// ============================================================
// Helper: Lấy path parameters type từ một endpoint
// ============================================================
export type ApiPathParams<
  Path extends keyof paths,
  Method extends HttpMethod & keyof paths[Path],
> = paths[Path][Method] extends {
  parameters: { path: infer P };
}
  ? P
  : never;

// ============================================================
// Helper: Lấy query parameters type từ một endpoint
// ============================================================
export type ApiQueryParams<
  Path extends keyof paths,
  Method extends HttpMethod & keyof paths[Path],
> = paths[Path][Method] extends {
  parameters: { query: infer Q };
}
  ? Q
  : never;
