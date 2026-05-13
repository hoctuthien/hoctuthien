import { createHttpClient } from './base';

/**
 * Client-side HTTP Client
 * Phía Client chỉ quan tâm đến dữ liệu trả về (data)
 */
const client = createHttpClient('', '/api');

/**
 * auto refresh
 */
const request = async <T>(
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  dataOrOptions?: any,
  options?: any
): Promise<T> => {
  try {
    const fn = (client as any)[method];
    const args = ['post', 'patch'].includes(method) ? [dataOrOptions, options] : [dataOrOptions];
    const response = await fn(path, ...args);
    return response.data;
  } catch (error: any) {
    // Nếu lỗi 401 và không phải đang ở trang login
    if (error.status === 401 && !path.includes('/auth/login') && typeof window !== 'undefined') {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};

export const httpClient = {
  get: <T>(path: string, options?: any) => request<T>('get', path, options),
  post: <T>(path: string, data?: any, options?: any) => request<T>('post', path, data, options),
  patch: <T>(path: string, data?: any, options?: any) => request<T>('patch', path, data, options),
  delete: <T>(path: string, options?: any) => request<T>('delete', path, options),
};
