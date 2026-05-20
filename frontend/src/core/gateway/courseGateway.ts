import { mockMentorCourses, MockCourse } from '@/shared/mocks/mentorCourses.mock';

// Để giữ trạng thái trong bộ nhớ tạm thời khi người dùng tương tác trong phiên làm việc
let inMemoryCourses = [...mockMentorCourses];

export const courseGateway = {
  /**
   * Lấy danh sách khóa học của mentor hiện tại
   */
  async getMyCourses(): Promise<MockCourse[]> {
    // Giả lập độ trễ mạng để giống gọi API thật
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...inMemoryCourses]);
      }, 500);
    });
  },

  /**
   * Tạo khóa học mới
   */
  async createCourse(payload: Omit<MockCourse, 'id' | 'createdAt' | 'studentsCount' | 'rating' | 'reviewsCount'>): Promise<MockCourse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCourse: MockCourse = {
          ...payload,
          id: `course-${Date.now()}`,
          studentsCount: 0,
          rating: 0,
          reviewsCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        inMemoryCourses = [newCourse, ...inMemoryCourses];
        resolve(newCourse);
      }, 500);
    });
  },

  /**
   * Cập nhật trạng thái hoặc thông tin khóa học
   */
  async updateCourse(id: string, payload: Partial<MockCourse>): Promise<MockCourse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = inMemoryCourses.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error("Course not found"));
          return;
        }
        const updatedCourse = {
          ...inMemoryCourses[index],
          ...payload,
        };
        inMemoryCourses[index] = updatedCourse;
        resolve(updatedCourse);
      }, 500);
    });
  },

  /**
   * Xóa khóa học
   */
  async deleteCourse(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        inMemoryCourses = inMemoryCourses.filter(c => c.id !== id);
        resolve(true);
      }, 500);
    });
  }
};
