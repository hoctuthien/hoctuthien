import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';

export enum PaymentType {
  ACTIVATION = 'activation',
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

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  transactionId: string | null;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({
    name: 'expired_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiredAt: Date | null;

  @Column({ name: 'vietqr_qr_data_url', type: 'text', nullable: true })
  vietqrQrDataUrl: string | null;

  // Lưu transactionCode, qrUrl và raw response từ TN App sau khi verify
  @Column({ name: 'vietqr_payload', type: 'jsonb', default: {} })
  vietqrPayload: Record<string, any>;

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
