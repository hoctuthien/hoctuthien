import { httpClient } from '../api/client';

export const penaltyTicketGateway = {
  /**
   * Tạo báo cáo phạt/báo cáo vắng mặt (Penalty Ticket)
   */
  async createPenaltyTicket(payload: {
    userId: string;
    reason: string;
    evidenceUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return httpClient.post('/v1/penalty-tickets', payload);
  },

  /**
   * Lấy toàn bộ danh sách penalty tickets (Admin only)
   */
  async getAll(): Promise<any> {
    return httpClient.get('/v1/penalty-tickets');
  },

  /**
   * Lấy chi tiết một penalty ticket
   */
  async getById(id: string): Promise<any> {
    return httpClient.get(`/v1/penalty-tickets/${id}`);
  },

  /**
   * Cập nhật trạng thái penalty ticket (Admin only)
   */
  async updateById(
    id: string,
    payload: {
      status?: 'pending' | 'rejected' | 'penalty' | 'cancel';
      pointsDeducted?: number;
      reason?: string;
    },
  ): Promise<any> {
    return httpClient.patch(`/v1/penalty-tickets/${id}`, payload);
  },
};
