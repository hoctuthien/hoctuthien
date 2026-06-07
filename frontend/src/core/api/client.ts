import { getSession } from 'next-auth/react';
import { createHttpClient } from './base';

/**
 * Client-side HTTP Client
 * Phía Client chỉ quan tâm đến dữ liệu trả về (data)
 */
const client = createHttpClient('', '/api');

let cachedToken: string | null = null;

export const setClientToken = (token: string | null) => {
  cachedToken = token;
};

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

    // Lấy token từ cache với fallback an toàn
    let token = cachedToken;
    if (!token && typeof window !== 'undefined') {
      const session = await getSession();
      token = (session as any)?.accessToken || null;
      cachedToken = token;
    }

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const mergedOptions = {
      ...options,
      headers: {
        ...options?.headers,
        ...authHeaders,
      },
    };

    const args = ['post', 'patch'].includes(method) ? [dataOrOptions, mergedOptions] : [mergedOptions];
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
