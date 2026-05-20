import { httpClient } from '../api/client';
import type { operations } from '../types/api.generated';

type LoginRequest = operations['AuthController_login']['requestBody']['content']['application/json'];
type RegisterRequest = operations['AuthController_register']['requestBody']['content']['application/json'];
type UserProfile = NonNullable<operations['AuthController_login']['responses'][201]['content']['application/json']['user']>;

export const authGateway = {
  /**
   * Đăng ký tài khoản
   */
  async register(payload: RegisterRequest): Promise<{ user: UserProfile }> {
    return httpClient.post<{ user: UserProfile }>('/v1/auths/register', payload);
  },

  /**
   * Đăng nhập thông qua BFF
   */
  async login(payload: LoginRequest): Promise<{ user: UserProfile }> {
    return httpClient.post<{ user: UserProfile }>('/v1/auths/login', payload);
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<{ user: UserProfile | null }> {
    return httpClient.get<{ user: UserProfile | null }>('/v1/users/me');
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    return httpClient.post('/v1/auths/logout');
  },
};
