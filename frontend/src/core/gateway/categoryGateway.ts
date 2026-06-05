import { httpClient } from '../api/client';

export const categoryGateway = {
  /**
   * Lấy danh sách tất cả category (có hỗ trợ pagination - lấy tối đa 100)
   */
  async getCategories(): Promise<any[]> {
    console.log('[categoryGateway] Fetching categories via GET /v1/categories?limit=100');
    const response = await httpClient.get<any>('/v1/categories?limit=100&page=1');
    // NestJS ResponseTransformInterceptor wraps response inside data field
    // response.data có thể là: { data: [...], meta: {...} } hoặc mảng trực tiếp
    const raw = response.data ?? response;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    // Handle double-wrap: { data: [{ data: [...], meta: {} }] }
    if (Array.isArray(raw?.[0]?.data)) return raw[0].data;
    return [];
  },

  /**
   * Lấy danh sách group category (endpoint này có thể bị lỗi trên một số môi trường)
   * Nếu lỗi, trả về mảng rỗng để FE gracefully degrade
   */
  async getGroupCategories(): Promise<any[]> {
    try {
      console.log('[categoryGateway] Fetching group categories via GET /v1/group-categories?limit=100');
      const response = await httpClient.get<any>('/v1/group-categories?limit=100&page=1');
      const raw = response.data ?? response;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (err) {
      console.warn('[categoryGateway] group-categories endpoint failed, using fallback:', err);
      return [];
    }
  },

  /**
   * Tạo category mới (Dành cho Mentor/Admin)
   * groupCategoryId là optional
   */
  async createCategory(payload: { name: string; groupCategoryId?: string }): Promise<any> {
    const body: Record<string, any> = { name: payload.name };
    if (payload.groupCategoryId) {
      body.groupCategoryId = payload.groupCategoryId;
    }
    console.log('[categoryGateway] Creating category via POST /v1/categories', body);
    const response = await httpClient.post<any>('/v1/categories', body);
    const raw = response?.data ?? response;
    if (Array.isArray(raw)) return raw[0];
    if (Array.isArray(raw?.data)) return raw.data[0];
    return raw;
  }
};
