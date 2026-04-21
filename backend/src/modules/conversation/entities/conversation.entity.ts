import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'conversations' })
export class ConversationEntity extends BaseEntity {
  @Column({ name: 'mentor_id', type: 'bigint' })
  mentorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: UserEntity;

  @Column({ name: 'mentee_id', type: 'bigint' })
  menteeId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: UserEntity;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
