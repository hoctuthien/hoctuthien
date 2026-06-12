import { PaymentEntity } from '../entities/payment.entity';

export interface PaymentStrategy {
  paymentType: string;
  
  /**
   * Tính toán hoặc lấy số tiền yêu cầu thanh toán.
   */
  resolveAmount(referenceId: string, customAmount?: number): Promise<number>;

  /**
   * Sinh tiền tố cho mô tả giao dịch (ví dụ: KICHHOAT, DANGKY)
   */
  resolveDescriptionPrefix(referenceId: string): string;

  /**
   * Hook chạy khi vừa tạo bản ghi thanh toán (dùng để liên kết paymentId với đối tượng nghiệp vụ)
   */
  onGenerate(payment: PaymentEntity, referenceId: string): Promise<void>;

  /**
   * Hook chạy khi thanh toán thành công
   */
  onSuccess(payment: PaymentEntity): Promise<void>;
}
