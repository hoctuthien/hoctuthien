import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseBookingEntity } from '../../course-booking/entities/course-booking.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'payments' })
export class PaymentEntity extends BaseEntity {
  @Column({ name: 'course_booking_id', type: 'bigint', unique: true })
  courseBookingId: string;

  @OneToOne(() => CourseBookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_booking_id' })
  courseBooking: CourseBookingEntity;

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
