import { createHttpClient } from './base';

/**
 * Client-side HTTP Client
 * Phía Client chỉ quan tâm đến dữ liệu trả về (data)
 */
const client = createHttpClient('', '/api');

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const subscribeTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

/**
 * auto refresh
 */
const request = async <T>(
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  ...args: any[]
): Promise<T> => {
  try {
    const fn = (client as any)[method];
    const response = await fn(path, ...args);
    return response.data;
  } catch (error: any) {
    // Nếu lỗi 401 và không phải đang ở các trang auth
    if (error.status === 401 && !path.includes('/auth/')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await client.post('/auth/refresh');
          isRefreshing = false;
          onRefreshed();
        } catch (refreshError) {
          isRefreshing = false;
          // Nếu refresh cũng lỗi thì logout luôn hoặc redirect sang login
          window.location.href = '/login';
          throw refreshError;
        }
      }

      // Đợi refresh xong rồi retry
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(request<T>(method, path, ...args));
        });
      });
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
