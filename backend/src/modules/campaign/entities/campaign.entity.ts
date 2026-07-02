import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity({ name: 'campaigns' })
export class CampaignEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({
    name: 'target_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  targetAmount: number;

  @Column({
    name: 'raised_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  raisedAmount: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  endDate: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;
}
