import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseBookingEntity } from '../../course-booking/entities/course-booking.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'user_reviews' })
export class UserReviewEntity extends BaseEntity {
  @Column({ name: 'course_booking_id', type: 'uuid' })
  courseBookingId: string;

  @ManyToOne(() => CourseBookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_booking_id' })
  courseBooking: CourseBookingEntity;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ name: 'reviewed_id', type: 'uuid' })
  reviewedId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewed_id' })
  reviewed: UserEntity;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string | null;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
