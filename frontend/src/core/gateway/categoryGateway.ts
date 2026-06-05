import { httpClient } from '../api/client';

export const categoryGateway = {
  /**
   * Lấy danh sách tất cả category (tối đa 100)
   */
  async getCategories(): Promise<any[]> {
    const response = await httpClient.get<any>('/v1/categories?limit=100&page=1');
    const raw = response.data ?? response;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    // Handle double-wrap: { data: [{ data: [...], meta: {} }] }
    if (Array.isArray(raw?.[0]?.data)) return raw[0].data;
    return [];
  },

  /**
   * Tạo category mới (Mentor/Admin)
   * groupCategoryId là optional
   */
  async createCategory(payload: { name: string; groupCategoryId?: string }): Promise<any> {
    const body: Record<string, any> = { name: payload.name };
    if (payload.groupCategoryId) {
      body.groupCategoryId = payload.groupCategoryId;
    }
    const response = await httpClient.post<any>('/v1/categories', body);
    const raw = response?.data ?? response;
    if (Array.isArray(raw)) return raw[0];
    if (Array.isArray(raw?.data)) return raw.data[0];
    return raw;
  }
};
