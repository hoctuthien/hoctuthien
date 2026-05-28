import { httpClient } from '../api/client';

export const courseBookingGateway = {
  /**
   * Đăng ký/Đặt lịch khóa học mới (REST API)
   */
  async bookCourse(payload: { courseId: string; meetingTime: Date; notesForMentor?: string }): Promise<any> {
    console.log('[courseBookingGateway] Executing bookCourse() calling POST /v1/course-bookings');
    return httpClient.post('/v1/course-bookings', payload);
  },
};
