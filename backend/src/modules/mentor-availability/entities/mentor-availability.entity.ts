import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';

@Entity({ name: 'mentor_availabilities' })
export class MentorAvailabilityEntity extends BaseEntity {
  @Column({ name: 'mentor_id', type: 'bigint' })
  mentorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: UserEntity;

  @Column({ name: 'approved_by', type: 'bigint', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approver: UserEntity | null;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'linkedin_url', type: 'varchar', length: 500, nullable: true })
  linkedinUrl: string | null;

  @Column({ name: 'years_of_experience', type: 'integer', nullable: true })
  yearsOfExperience: number | null;

  @Column({ type: 'jsonb', default: [] })
  skills: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: MentorAvailabilityStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;
}
