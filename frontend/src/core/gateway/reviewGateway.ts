import { httpClient } from '../api/client';

export const reviewGateway = {
  /**
   * Tạo đánh giá khóa học (REST API)
   */
  async createCourseReview(payload: {
    courseBookingId: string;
    courseId: string;
    rating: number;
    comment?: string;
  }): Promise<any> {
    console.log('[reviewGateway] Executing createCourseReview() calling POST /v1/course-reviews');
    return httpClient.post('/v1/course-reviews', payload);
  },

  /**
   * Tạo đánh giá người dùng (Mentor/Mentee) (REST API)
   */
  async createUserReview(payload: {
    courseBookingId: string;
    reviewedId: string;
    rating: number;
    comment?: string;
  }): Promise<any> {
    console.log('[reviewGateway] Executing createUserReview() calling POST /v1/user-reviews');
    return httpClient.post('/v1/user-reviews', payload);
  },
};
