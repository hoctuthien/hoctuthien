import { httpClient } from '../api/client';
import { MentorRegisterValues } from '@/app/(dashboard)/mentor/register/mentor-register.schema';

export const mentorGateway = {
  /**
   * Đăng ký trở thành Mentor
   */
  async createMentorAvailability(payload: MentorRegisterValues): Promise<any> {
    return httpClient.post('/v1/mentor-availabilities', payload);
  },

  /**
   * Lấy danh sách yêu cầu đăng ký của bản thân
   */
  async getMyApplications(): Promise<any> {
    return httpClient.get('/v1/mentor-availabilities/me');
  }
};
