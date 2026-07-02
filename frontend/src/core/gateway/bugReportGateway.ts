import { httpClient } from '../api/client';
import type { operations } from '../types/api.generated';

export type BugReport = NonNullable<operations['BugReportController_findAll']['responses'][200]['content']['application/json']['data']>[number];
export type BugReportSeverity = NonNullable<operations['BugReportController_create']['requestBody']['content']['application/json']['severity']>;
export type BugReportStatus = NonNullable<operations['BugReportController_update']['requestBody']['content']['application/json']['status']>;

export type CreateBugReportPayload = operations['BugReportController_create']['requestBody']['content']['application/json'];
export type UpdateBugReportPayload = operations['BugReportController_update']['requestBody']['content']['application/json'];

export const bugReportGateway = {
  /**
   * Gửi báo cáo lỗi mới (Bất kỳ user đã đăng nhập)
   */
  async create(payload: CreateBugReportPayload): Promise<any> {
    return httpClient.post('/v1/bug-reports', payload);
  },

  /**
   * Lấy toàn bộ danh sách bug reports
   * - ADMIN: xem toàn bộ
   * - USER/MENTOR/MENTEE: chỉ xem của chính mình
   */
  async getAll(): Promise<any> {
    return httpClient.get('/v1/bug-reports');
  },

  /**
   * Xem chi tiết một bug report (Admin hoặc người tạo)
   */
  async getById(id: string): Promise<any> {
    return httpClient.get(`/v1/bug-reports/${id}`);
  },

  /**
   * Cập nhật trạng thái / mức độ nghiêm trọng (ADMIN only)
   */
  async updateById(id: string, payload: UpdateBugReportPayload): Promise<any> {
    return httpClient.patch(`/v1/bug-reports/${id}`, payload);
  },

  /**
   * Xóa mềm bug report (ADMIN only)
   */
  async removeById(id: string): Promise<any> {
    return httpClient.delete(`/v1/bug-reports/${id}`);
  },
};
