import { gqlClient } from '../api/graphql-client';
import {
  GET_ALL_AVAILABILITIES_QUERY,
} from './mentor.queries';
import { httpClient } from '../api/client';
import { MentorRegisterValues } from '@/app/(dashboard)/mentor/register/mentor-register.schema';

export const mentorGateway = {
  /**
   * Đăng ký trở thành Mentor (Sử dụng HTTP POST)
   */
  async createMentorAvailability(payload: MentorRegisterValues): Promise<any> {
    return httpClient.post('/v1/mentor-availabilities', payload);
  },
  /**
   * Lấy danh sách tất cả yêu cầu đăng ký (Dành cho Admin - Sử dụng GraphQL Query)
   */
  async getAllApplications(): Promise<any> {
    const result = await gqlClient.request<any>(GET_ALL_AVAILABILITIES_QUERY);
    return result.mentorAvailabilities;
  },

  /**
   * Lấy thông tin Mentor Profile của một User cụ thể (REST API)
   */
  async getMentorProfileByUserId(userId: string): Promise<any> {
    console.log(`[mentorGateway] Fetching mentor profile for userId=\${userId} via GET /v1/mentor-profiles/user/\${userId}`);
    return httpClient.get(`/v1/mentor-profiles/user/\${userId}`);
  },
};
