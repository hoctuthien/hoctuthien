import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { BadgeEntity } from './badge.entity';

@Entity({ name: 'user_badges' })
export class UserBadgeEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'badge_id', type: 'uuid' })
  badgeId: string;

  @ManyToOne(() => BadgeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badge_id' })
  badge: BadgeEntity;

  @Column({ name: 'awarded_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  awardedAt: Date;
}
