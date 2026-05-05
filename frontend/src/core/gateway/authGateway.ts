import { httpClient } from '../api/client';
import type { operations } from '../types/api.generated';

type LoginRequest = operations['AuthController_login']['requestBody']['content']['application/json'];
type UserProfile = NonNullable<operations['AuthController_login']['responses'][201]['content']['application/json']['user']>;

export const authGateway = {
  /**
   * Đăng nhập thông qua BFF
   */
  async login(payload: LoginRequest): Promise<{ user: UserProfile }> {
    return httpClient.post<{ user: UserProfile }>('/auth/login', payload);
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<{ user: UserProfile | null }> {
    return httpClient.get<{ user: UserProfile | null }>('/auth/me');
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    return httpClient.post('/auth/logout');
  },
};
