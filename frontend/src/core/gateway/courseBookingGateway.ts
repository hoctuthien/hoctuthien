import { httpClient } from '../api/client';

export const courseBookingGateway = {
  /**
   * Đăng ký/Đặt lịch khóa học mới (REST API)
   */
  async bookCourse(payload: { courseId: string; meetingTime: Date; notesForMentor?: string }): Promise<any> {
    console.log('[courseBookingGateway] Executing bookCourse() calling POST /v1/course-bookings');
    return httpClient.post('/v1/course-bookings', payload);
  },

  /**
   * Lấy danh sách lịch học (bookings) của bản thân
   * Phân quyền tự động theo vai trò đăng nhập
   */
  async getMyBookings(params?: { courseId?: string; status?: string; page?: number; limit?: number }): Promise<any> {
    console.log('[courseBookingGateway] Executing getMyBookings() calling GET /v1/course-bookings');
    return httpClient.get('/v1/course-bookings', { params });
  },

  /**
   * Học viên (Mentee) tự cập nhật ghi chú hoặc hủy lịch học
   */
  async cancelBookingByMentee(id: string, cancellationReason: string): Promise<any> {
    console.log(`[courseBookingGateway] Executing cancelBookingByMentee() calling PATCH /v1/course-bookings/${id}/me`);
    return httpClient.patch(`/v1/course-bookings/${id}/me`, {
      status: 'cancelled',
      cancellationReason,
    });
  },

  /**
   * Cố vấn (Mentor) hoặc Admin cập nhật lịch học (status, meet link, đổi giờ...)
   */
  async updateBooking(id: string, payload: { status?: string; googleMeetUrl?: string; meetingTime?: Date; cancellationReason?: string }): Promise<any> {
    console.log(`[courseBookingGateway] Executing updateBooking() calling PATCH /v1/course-bookings/${id}`);
    return httpClient.patch(`/v1/course-bookings/${id}`, payload);
  },

  /**
   * Kiểm tra trùng lịch học trước khi đăng ký hoặc thay đổi
   */
  async checkConflict(meetingTime: Date, courseId: string): Promise<{ hasConflict: boolean; conflictType?: string; message?: string }> {
    console.log('[courseBookingGateway] Executing checkConflict() calling GET /v1/course-bookings/check-conflict');
    return httpClient.get('/v1/course-bookings/check-conflict', {
      params: {
        meetingTime: meetingTime.toISOString(),
        courseId,
      },
    });
  },
};
