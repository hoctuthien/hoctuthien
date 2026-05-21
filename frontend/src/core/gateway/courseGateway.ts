import { MockCourse } from '@/shared/mocks/mentorCourses.mock';
import { httpClient } from '../api/client';

const translateCourse = (course: any): MockCourse => {
  // Map backend status to frontend status
  let status: MockCourse['status'] = 'draft';
  if (course.status === 'ACTIVE') status = 'published';
  else if (course.status === 'PENDING') status = 'pending';
  else if (course.status === 'INACTIVE') status = 'rejected';
  else if (course.status === 'DRAFT') status = 'draft';

  return {
    id: course.id,
    title: course.title,
    thumbnail: course.thumbnailUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=300&q=80',
    category: course.metadata?.categoryName || 'Chưa phân loại',
    price: Number(course.price),
    studentsCount: course.metadata?.studentsCount || 0,
    rating: course.metadata?.rating || 0,
    reviewsCount: course.metadata?.reviewsCount || 0,
    status,
    createdAt: new Date(course.createdAt).toISOString().split('T')[0],
  };
};

export const courseGateway = {
  /**
   * Lấy danh sách khóa học của mentor hiện tại
   */
  async getMyCourses(): Promise<MockCourse[]> {
    try {
      // 1. Lấy thông tin tài khoản mentor hiện tại
      const me = await httpClient.get<any>('/v1/users/me');
      
      // 2. Lấy danh sách khóa học lọc theo mentorId
      const response = await httpClient.get<{ items: any[] }>(`/v1/courses?mentorId=${me.id}&limit=100`);
      return (response.items || []).map(translateCourse);
    } catch (error) {
      console.warn('Failed to fetch mentor courses, fetching all public courses as fallback:', error);
      
      // Fallback: Lấy toàn bộ khóa học công khai nếu chưa đăng nhập hoặc gặp lỗi
      const response = await httpClient.get<{ items: any[] }>('/v1/courses?limit=100');
      return (response.items || []).map(translateCourse);
    }
  },

  /**
   * Lấy danh sách khóa học công khai từ backend
   */
  async getPublicCourses(): Promise<MockCourse[]> {
    const response = await httpClient.get<{ items: any[] }>('/v1/courses?limit=100');
    return (response.items || []).map(translateCourse);
  },

  /**
   * Tạo khóa học mới
   */
  async createCourse(payload: Omit<MockCourse, 'id' | 'createdAt' | 'studentsCount' | 'rating' | 'reviewsCount'>): Promise<MockCourse> {
    let status = 'DRAFT';
    if (payload.status === 'published') status = 'ACTIVE';
    else if (payload.status === 'pending') status = 'PENDING';
    else if (payload.status === 'rejected') status = 'INACTIVE';

    const body = {
      title: payload.title,
      price: Number(payload.price),
      durationMinutes: 60,
      status,
      metadata: {
        categoryName: payload.category || 'Chưa phân loại',
        rating: 0,
        reviewsCount: 0,
        studentsCount: 0,
      },
    };

    const response = await httpClient.post<any>('/v1/courses', body);
    return translateCourse(response);
  },

  /**
   * Cập nhật trạng thái hoặc thông tin khóa học
   */
  async updateCourse(id: string, payload: Partial<MockCourse>): Promise<MockCourse> {
    const body: any = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.price !== undefined) body.price = Number(payload.price);
    if (payload.status !== undefined) {
      let status = 'DRAFT';
      if (payload.status === 'published') status = 'ACTIVE';
      else if (payload.status === 'pending') status = 'PENDING';
      else if (payload.status === 'rejected') status = 'INACTIVE';
      body.status = status;
    }
    
    // Nếu category được cập nhật, đảm bảo giữ các trường metadata cũ hoặc ghi đè
    if (payload.category !== undefined) {
      body.metadata = {
        categoryName: payload.category,
      };
    }

    const response = await httpClient.patch<any>(`/v1/courses/${id}`, body);
    return translateCourse(response);
  },

  /**
   * Xóa khóa học
   */
  async deleteCourse(id: string): Promise<boolean> {
    await httpClient.delete(`/v1/courses/${id}`);
    return true;
  },
};
