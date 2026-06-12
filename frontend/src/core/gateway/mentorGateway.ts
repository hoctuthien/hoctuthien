import { gqlClient } from '../api/graphql-client';
import {
  GET_ALL_AVAILABILITIES_QUERY,
} from './mentor.queries';
import { httpClient } from '../api/client';
import { apiService } from '../api/base';
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
   * Lấy danh sách Mentor Profiles có phân trang, tìm kiếm, lọc
   * Dùng apiService (fetch-based) để hoạt động ở cả Server Component
   */
  async getAllMentorProfiles(params?: { page?: number; limit?: number; search?: string; skills?: string; minExperience?: number }): Promise<any> {
    // Convert số sang string vì URLSearchParams chỉ nhận string
    const stringParams: Record<string, string> = {};
    if (params?.page != null) stringParams.page = String(params.page);
    if (params?.limit != null) stringParams.limit = String(params.limit);
    if (params?.search) stringParams.search = params.search;
    if (params?.skills) stringParams.skills = params.skills;
    if (params?.minExperience != null) stringParams.minExperience = String(params.minExperience);

    const res = await apiService.get<any>('/mentor-profiles', { params: stringParams });
    // apiService trả về { data, headers, status } — lấy response body
    return res.data;
  },

  /**
   * Lấy thông tin Mentor Profile của một User cụ thể (REST API)
   */
  async getMentorProfileByUserId(userId: string): Promise<any> {
    console.log(`[mentorGateway] Fetching mentor profile for userId=\${userId} via GET /v1/mentor-profiles/user/\${userId}`);
    return httpClient.get(`/v1/mentor-profiles/user/\${userId}`);
  },
};
