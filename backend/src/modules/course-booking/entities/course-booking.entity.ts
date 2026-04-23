import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PaymentEntity } from '../../payment/entities/payment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

@Entity({ name: 'course_bookings' })
export class CourseBookingEntity extends BaseEntity {
  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ name: 'mentee_id', type: 'bigint' })
  menteeId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: UserEntity;

  @Column({ name: 'meeting_time', type: 'timestamp with time zone' })
  meetingTime: Date;

  @Column({ name: 'google_meet_url', type: 'varchar', length: 500, nullable: true })
  googleMeetUrl: string | null;

  @Column({ name: 'calendar_event_id', type: 'varchar', length: 255, nullable: true })
  calendarEventId: string | null;

  @Column({ name: 'notes_for_mentor', type: 'text', nullable: true })
  notesForMentor: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'payment_id', type: 'bigint', nullable: true })
  paymentId: string | null;

  @OneToOne(() => PaymentEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;
}
