import { gqlClient } from '../api/graphql-client';
import { MentorRegisterValues } from '@/app/(dashboard)/mentor/register/mentor-register.schema';
import {
  CREATE_MENTOR_AVAILABILITY_MUTATION,
  GET_MY_AVAILABILITIES_QUERY,
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
};
