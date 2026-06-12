import { gqlClient } from '../api/graphql-client';
import { httpClient } from '../api/client';
import {
  GET_ALL_AVAILABILITIES_QUERY,
  GET_MENTOR_AVAILABILITY_QUERY,
} from './mentor.queries';

export const mentorApplicationsGateway = {
  /**
   * Lấy danh sách tất cả yêu cầu đăng ký (Dành cho Admin - Sử dụng GraphQL Query)
   */
  async getAllApplications(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<any> {
    const result = await gqlClient.request<any>(GET_ALL_AVAILABILITIES_QUERY, params);
    return result.mentorAvailabilities;
  },

  /**
   * Lấy chi tiết một yêu cầu đăng ký (Dành cho Admin - Sử dụng GraphQL Query)
   */
  async getApplicationDetail(id: string): Promise<any> {
    const result = await gqlClient.request<any>(GET_MENTOR_AVAILABILITY_QUERY, { id });
    return result.mentorAvailability;
  },

  /**
   * Chuyển trạng thái sang Đang xử lý (In Progress) (Dành cho Admin - Sử dụng REST API PATCH)
   */
  async updateToInProgress(id: string): Promise<any> {
    return httpClient.patch(`/v1/mentor-availabilities/${id}/in-progress`, {});
  },

  /**
   * Phê duyệt yêu cầu làm Mentor (Approved) (Dành cho Admin - Sử dụng REST API PATCH)
   */
  async approveApplication(id: string, note: string): Promise<any> {
    return httpClient.patch(`/v1/mentor-availabilities/${id}/approved`, { note });
  },

  /**
   * Từ chối yêu cầu làm Mentor (Rejected) (Dành cho Admin - Sử dụng REST API PATCH)
   */
  async rejectApplication(id: string, note: string): Promise<any> {
    return httpClient.patch(`/v1/mentor-availabilities/${id}/rejected`, { note });
  },
};
