import { gqlClient } from '../api/graphql-client';
import { MentorRegisterValues } from '@/app/(dashboard)/mentor/register/mentor-register.schema';
import {
  CREATE_MENTOR_AVAILABILITY_MUTATION,
  GET_MY_AVAILABILITIES_QUERY,
  GET_ALL_AVAILABILITIES_QUERY,
  GET_MENTOR_AVAILABILITY_QUERY,
} from './mentor.queries';
import { httpClient } from '../api/client';

export const mentorGateway = {
  /**
   * Đăng ký trở thành Mentor (Sử dụng HTTP POST)
   */
  async createMentorAvailability(payload: MentorRegisterValues): Promise<any> {
    return httpClient.post('/v1/mentor-availabilities', payload);
  },

  /**
   * Lấy danh sách yêu cầu đăng ký của bản thân (Sử dụng GraphQL Query)
   */
  async getMyApplications(): Promise<any> {
    const result = await gqlClient.request<any>(GET_MY_AVAILABILITIES_QUERY);
    return result.myMentorAvailabilities;
  },

  /**
   * Lấy danh sách tất cả yêu cầu đăng ký (Dành cho Admin - Sử dụng GraphQL Query)
   */
  async getAllApplications(): Promise<any> {
    const result = await gqlClient.request<any>(GET_ALL_AVAILABILITIES_QUERY);
    return result.mentorAvailabilities;
  },

  /**
   * Lấy chi tiết một yêu cầu đăng ký (Dành cho Admin - Sử dụng GraphQL Query)
   */
  async getApplicationDetail(id: string): Promise<any> {
    const result = await gqlClient.request<any>(GET_MENTOR_AVAILABILITY_QUERY, { id });
    return result.mentorAvailability;
  },
};
