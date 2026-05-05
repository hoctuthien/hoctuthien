import { createHttpClient } from './base';

/**
 * Client-side HTTP Client
 * Phía Client chỉ quan tâm đến dữ liệu trả về (data)
 */
const client = createHttpClient('', '/api');

export const httpClient = {
  get: async <T>(path: string, options?: any) => (await client.get<T>(path, options)).data,
  post: async <T>(path: string, data?: any, options?: any) => (await client.post<T>(path, data, options)).data,
  patch: async <T>(path: string, data?: any, options?: any) => (await client.patch<T>(path, data, options)).data,
  delete: async <T>(path: string, options?: any) => (await client.delete<T>(path, options)).data,
};
