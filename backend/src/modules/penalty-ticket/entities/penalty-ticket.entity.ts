import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum PenaltyTicketStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  PENALTY = 'penalty',
  CANCEL = 'cancel',
}

@Entity({ name: 'penalty_tickets' })
export class PenaltyTicketEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'reported_by_id', type: 'uuid', nullable: true })
  reportedById: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reported_by_id' })
  reportedBy: UserEntity | null;

  @Column({ name: 'updated_by_id', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updater: UserEntity | null;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'points_deducted', type: 'integer', default: 0 })
  pointsDeducted: number;

  @Column({
    name: 'evidence_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  evidenceUrl: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: PenaltyTicketStatus,
    default: PenaltyTicketStatus.PENDING,
  })
  status: PenaltyTicketStatus;
}
