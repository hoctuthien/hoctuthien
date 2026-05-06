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
    // Nếu lỗi 401 và không phải là API login/refresh
    const isAuthPath = path === '/auth/login' || path === '/auth/refresh';
    if (error.status === 401 && !isAuthPath) {
      if (!isRefreshing) {
        console.log('[HTTPClient] Access Token expired, attempting refresh...');
        isRefreshing = true;
        try {
          await client.post('/auth/refresh');
          console.log('[HTTPClient] Refresh success, retrying original request:', path);
          isRefreshing = false;
          onRefreshed();
        } catch (refreshError) {
          console.error('[HTTPClient] Refresh failed, redirecting to login');
          isRefreshing = false;
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
