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
  dataOrOptions?: any,
  options?: any,
  _retryCount = 0 // Thêm biến đếm retry nội bộ
): Promise<T> => {
  try {
    const fn = (client as any)[method];
    // Sắp xếp lại đối số vì post/patch có thêm data
    const args = ['post', 'patch'].includes(method) ? [dataOrOptions, options] : [dataOrOptions];
    const response = await fn(path, ...args);
    return response.data;
  } catch (error: any) {
    const isAuthPath = path === '/auth/login' || path === '/auth/refresh';
    
    // Nếu lỗi 401 và chưa quá số lần retry cho phép
    if (error.status === 401 && !isAuthPath && _retryCount < 1) {
      if (!isRefreshing) {
        console.log('[HTTPClient] Access Token expired, initiating refresh...');
        isRefreshing = true;
        try {
          await client.post('/auth/refresh');
          console.log('[HTTPClient] Refresh success, retrying original request:', path);
          isRefreshing = false;
          onRefreshed();
          
          // Retry với _retryCount = 1 để không lặp vô tận
          return request<T>(method, path, dataOrOptions, options, 1);
        } catch (refreshError) {
          console.error('[HTTPClient] Refresh failed, redirecting to login');
          isRefreshing = false;
          
          // Tránh vòng lặp redirect nếu đang ở trang login rồi
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw refreshError;
        }
      } else {
        console.log('[HTTPClient] Refresh in progress, queuing request:', path);
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(request<T>(method, path, dataOrOptions, options, 1));
          });
        });
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
