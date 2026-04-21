import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { CourseBookingEntity } from '../../course-booking/entities/course-booking.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'course_reviews' })
export class CourseReviewEntity extends BaseEntity {
  @Column({ name: 'course_booking_id', type: 'bigint', unique: true })
  courseBookingId: string;

  @OneToOne(() => CourseBookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_booking_id' })
  courseBooking: CourseBookingEntity;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ name: 'reviewer_id', type: 'bigint' })
  reviewerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
