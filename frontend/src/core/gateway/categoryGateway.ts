import { httpClient } from '../api/client';

export const categoryGateway = {
  /**
   * Lấy danh sách tất cả category
   */
  async getCategories(): Promise<any[]> {
    console.log('[categoryGateway] Fetching categories via GET /v1/categories?limit=100');
    const response = await httpClient.get<any>('/v1/categories?limit=100');
    // NestJS ResponseTransformInterceptor wraps response inside data field
    return response.data || response;
  },

  /**
   * Lấy danh sách tất cả group category
   */
  async getGroupCategories(): Promise<any[]> {
    console.log('[categoryGateway] Fetching group categories via GET /v1/group-categories?limit=100');
    const response = await httpClient.get<any>('/v1/group-categories?limit=100');
    return response.data || response;
  },

  /**
   * Tạo category mới (Dành cho Mentor/Admin)
   */
  async createCategory(payload: { name: string; groupCategoryId: string }): Promise<any> {
    console.log('[categoryGateway] Creating category via POST /v1/categories', payload);
    const response = await httpClient.post<any>('/v1/categories', payload);
    const categoryObj = response?.data?.[0] || response?.data || response;
    return categoryObj;
  }
};
