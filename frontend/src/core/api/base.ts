/**
 * Core HTTP Client Factory
 */

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

export const createHttpClient = (baseUrl: string, prefix: string = '') => {
  const request = async <T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
    let url = `${baseUrl.replace(/\/$/, '')}${prefix}${path.startsWith('/') ? path : `/${path}`}`;
    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams.toString()}`;
    }

    console.log(`[httpClient] Making request: ${options.method || 'GET'} ${url}`, {
      headers: options.headers,
    });

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[httpClient] ${response.status} Error Response from ${url}:`, errorData);
        throw {
          ...errorData,
          status: response.status,
        };
      }

      // Trả về cả data và headers
      const data = await response.json();
      console.log(`[httpClient] ${response.status} Success Response from ${url}:`, data);
      return {
        data,
        headers: response.headers,
        status: response.status,
      };
    } catch (fetchError: any) {
      // Chỉ log nếu không phải lỗi HTTP đã được xử lý bên trên
      if (!fetchError?.status) {
        console.warn(`[httpClient] Network error calling ${url}:`, fetchError?.message || fetchError);
      }
      throw fetchError;
    }
  };

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, data?: any, options?: RequestOptions) => 
      request<T>(path, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    patch: <T>(path: string, data?: any, options?: RequestOptions) => 
      request<T>(path, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
  };
};

export const apiService = createHttpClient(
  process.env.BACKEND_URL || 'http://localhost:5050',
  '/api/v1'
);
