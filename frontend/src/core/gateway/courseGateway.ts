import { MockCourse } from '@/shared/mocks/mentorCourses.mock';
import { httpClient } from '../api/client';
import { gql } from 'graphql-request';
import { gqlClient } from '../api/graphql-client';
import { authGateway } from './authGateway';

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
    category: course.categories?.[0]?.name || course.metadata?.categoryName || 'Chưa phân loại',
    price: Number(course.price),
    studentsCount: course.metadata?.studentsCount || 0,
    rating: course.metadata?.rating || 0,
    reviewsCount: course.metadata?.reviewsCount || 0,
    status,
    createdAt: course.createdAt ? new Date(course.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: course.description || '',
    durationMinutes: Number(course.durationMinutes || 60),
    prerequisites: course.prerequisites || [],
    metadata: course.metadata || {},
    mentorId: course.mentorId || '',
  };
};

export const courseGateway = {
  /**
   * Lấy danh sách khóa học của mentor hiện tại
   */
  async getMyCourses(): Promise<MockCourse[]> {
    console.log('[courseGateway] Executing getMyCourses()');
    try {
      // 1. Lấy thông tin tài khoản mentor hiện tại
      console.log('[courseGateway] Fetching current mentor profile via authGateway.getMe');
      const meRes = await authGateway.getMe();
      const me = meRes.user;
      if (!me) {
        throw new Error('Không tìm thấy thông tin Mentor đăng nhập.');
      }
      console.log('[courseGateway] Mentor profile fetched successfully:', me);

      // 2. Lấy danh sách khóa học lọc theo mentorId
      console.log(`[courseGateway] Fetching courses for mentorId=${me.id} via GET /v1/courses?mentorId=${me.id}&limit=100`);
      const response = await httpClient.get<any>(`/v1/courses?mentorId=${me.id}&limit=100`);
      console.log('[courseGateway] Mentor courses fetched successfully:', response);
      const items = response?.data || [];
      return items.map(translateCourse);
    } catch (error: any) {
      console.warn('[courseGateway] Failed to fetch mentor courses, fetching all public courses as fallback:', error);

      // Fallback: Lấy toàn bộ khóa học công khai nếu chưa đăng nhập hoặc gặp lỗi
      console.log('[courseGateway] Executing fallback: Fetching public courses via GET /v1/courses?limit=100');
      try {
        const response = await httpClient.get<any>('/v1/courses?limit=100');
        console.log('[courseGateway] Fallback public courses fetched successfully:', response);
        const items = response?.data || [];
        return items.map(translateCourse);
      } catch (fallbackError: any) {
        console.error('[courseGateway] Fallback fetch failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Lấy danh sách khóa học công khai từ backend (GraphQL)
   */
  async getPublicCourses(): Promise<MockCourse[]> {
    console.log('[courseGateway] Executing getPublicCourses() calling GraphQL query "courses"');
    try {
      const query = gql`
        query GetPublicCourses {
          courses {
            id
            mentorId
            approvedBy
            title
            description
            thumbnailUrl
            price
            durationMinutes
            status
            categories {
              id
              name
              slug
            }
          }
        }
      `;
      const response = await gqlClient.request<any>(query);
      console.log('[courseGateway] Successfully fetched courses from GraphQL:', response);
      return (response.courses || []).map(translateCourse);
    } catch (error: any) {
      console.error('[courseGateway] Error in getPublicCourses() via GraphQL:', {
        message: error.message || 'Unknown error',
        errorDetails: error
      });
      
      // Fallback: Lấy toàn bộ khóa học công khai qua REST GET nếu GraphQL gặp lỗi
      console.log('[courseGateway] Fallback: Fetching public courses via REST GET /v1/courses?limit=100');
      try {
        const restResponse = await httpClient.get<any>('/v1/courses?limit=100');
        console.log('[courseGateway] Fallback REST public courses fetched successfully:', restResponse);
        const items = restResponse?.data || [];
        return items.map(translateCourse);
      } catch (restError) {
        console.error('[courseGateway] Fallback REST fetch also failed:', restError);
        throw error;
      }
    }
  },

  /**
   * Lấy chi tiết khóa học theo ID từ backend (GraphQL)
   */
  async getCourseDetail(id: string): Promise<MockCourse | null> {
    console.log(`[courseGateway] Executing getCourseDetail() calling GraphQL query "course" for ID: ${id}`);
    try {
      const query = gql`
        query GetCourse($id: ID!) {
          course(id: $id) {
            id
            mentorId
            approvedBy
            title
            description
            thumbnailUrl
            price
            durationMinutes
            status
            categories {
              id
              name
              slug
            }
            prerequisites
            metadata
          }
        }
      `;
      const response = await gqlClient.request<any>(query, { id });
      if (!response.course) return null;
      return translateCourse(response.course);
    } catch (error: any) {
      console.error(`[courseGateway] Error in getCourseDetail() via GraphQL:`, error);
      
      // Fallback: Lấy chi tiết qua REST GET
      console.log(`[courseGateway] Fallback: Fetching course detail via REST GET /v1/courses/${id}`);
      try {
        const response = await httpClient.get<any>(`/v1/courses/${id}`);
        const courseObj = response?.data?.[0] || response?.data || response;
        return translateCourse(courseObj);
      } catch (restError) {
        console.error('[courseGateway] Fallback REST fetch failed:', restError);
        throw error;
      }
    }
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
      description: payload.description,
      thumbnailUrl: payload.thumbnail,
      price: Number(payload.price),
      durationMinutes: payload.durationMinutes || 60,
      prerequisites: payload.prerequisites || [],
      status,
      metadata: {
        categoryName: payload.category || 'Chưa phân loại',
        rating: 0,
        reviewsCount: 0,
        studentsCount: 0,
        ...payload.metadata,
      },
    };

    const response = await httpClient.post<any>('/v1/courses', body);
    const courseObj = response?.data?.[0] || response?.data || response;
    return translateCourse(courseObj);
  },

  /**
   * Cập nhật trạng thái hoặc thông tin khóa học
   */
  async updateCourse(id: string, payload: Partial<MockCourse>): Promise<MockCourse> {
    const body: any = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.thumbnail !== undefined) body.thumbnailUrl = payload.thumbnail;
    if (payload.price !== undefined) body.price = Number(payload.price);
    if (payload.durationMinutes !== undefined) body.durationMinutes = Number(payload.durationMinutes);
    if (payload.prerequisites !== undefined) body.prerequisites = payload.prerequisites;
    if (payload.status !== undefined) {
      let status = 'DRAFT';
      if (payload.status === 'published') status = 'ACTIVE';
      else if (payload.status === 'pending') status = 'PENDING';
      else if (payload.status === 'rejected') status = 'INACTIVE';
      body.status = status;
    }

    if (payload.category !== undefined || payload.metadata !== undefined) {
      body.metadata = {
        ...(payload.metadata || {}),
      };
      if (payload.category !== undefined) {
        body.metadata.categoryName = payload.category;
      }
    }

    const response = await httpClient.patch<any>(`/v1/courses/${id}`, body);
    const courseObj = response?.data?.[0] || response?.data || response;
    return translateCourse(courseObj);
  },

  /**
   * Xóa khóa học
   */
  async deleteCourse(id: string): Promise<boolean> {
    await httpClient.delete(`/v1/courses/${id}`);
    return true;
  },
};
