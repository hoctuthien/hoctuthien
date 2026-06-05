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
    const res = await httpClient.post<any>('/v1/auths/register', payload);
    const user = res?.data?.[0]?.user || res?.user;
    return { user };
  },

  /**
   * Đăng nhập thông qua BFF
   */
  async login(payload: LoginRequest): Promise<{ user: UserProfile }> {
    const res = await httpClient.post<any>('/v1/auths/login', payload);
    const user = res?.data?.[0]?.user || res?.user;
    return { user };
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<{ user: UserProfile | null }> {
    const res = await httpClient.get<any>('/v1/users/me');
    let user: UserProfile | null = null;
    if (res) {
      if (Array.isArray(res.data)) {
        user = res.data[0]?.user || null;
      } else if (res.data && typeof res.data === 'object') {
        user = res.data.user || null;
      } else if (res.user) {
        user = res.user;
      }
    }
    return { user };
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    return httpClient.post('/v1/auths/logout');
  },
};
