import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';

// Loại thanh toán — define tại đây vì thuộc domain Payment
export enum PaymentType {
  ACTIVATION = 'activation', // Phí kích hoạt tài khoản mentor
}

export { PaymentStatus };


@Entity({ name: 'payments' })
export class PaymentEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, unique: true, nullable: true })
  transactionId: string | null;

  // Nội dung chuyển khoản gửi lên VietQR (ví dụ: "HOCTUTHIEN 123456")
  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string | null;

  // Thời điểm QR code hết hạn
  @Column({ name: 'expired_at', type: 'timestamp with time zone', nullable: true })
  expiredAt: Date | null;

  // Base64 hoặc URL ảnh QR trả về từ VietQR API
  @Column({ name: 'vietqr_qr_data_url', type: 'text', nullable: true })
  vietqrQrDataUrl: string | null;

  // Raw response payload từ VietQR API (bank_code, account_no, qrCode...)
  @Column({ name: 'vietqr_payload', type: 'jsonb', default: {} })
  vietqrPayload: Record<string, any>;

  // Generic payload cho các payment gateway khác (giữ lại để backward-compatible)
  @Column({ name: 'payment_gateway_payload', type: 'jsonb', default: {} })
  paymentGatewayPayload: Record<string, any>;

  @Column({ name: 'paid_at', type: 'timestamp with time zone', nullable: true })
  paidAt: Date | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;
}
