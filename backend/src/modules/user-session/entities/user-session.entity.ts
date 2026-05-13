import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'user_sessions' })
export class UserSessionEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 100, nullable: true })
  deviceType: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({
    name: 'refresh_token_expires_at',
    type: 'timestamp with time zone',
  })
  refreshTokenExpiresAt: Date;

  @Column({
    name: 'last_used_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastUsedAt: Date | null;

  @Column({
    name: 'revoked_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  revokedAt: Date | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
