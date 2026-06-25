import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum BadgeCondition {
  FIRST_BOOKING = 'FIRST_BOOKING',
  COMPLETE_5_SESSIONS = 'COMPLETE_5_SESSIONS',
  COMPLETE_10_SESSIONS = 'COMPLETE_10_SESSIONS',
  TOP_MENTOR_10_STUDENTS = 'TOP_MENTOR_10_STUDENTS',
  TOP_MENTOR_50_STUDENTS = 'TOP_MENTOR_50_STUDENTS',
  FIRST_REVIEW = 'FIRST_REVIEW',
}

@Entity({ name: 'badges' })
export class BadgeEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({
    type: 'enum',
    enum: BadgeCondition,
    unique: true,
  })
  condition: BadgeCondition;
}
