import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('user_sessions')
export class UserSessionEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @Column({ name: 'device_name', nullable: true })
  deviceName: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamptz' })
  refreshTokenExpiresAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ default: 'active' })
  status: string;

  // Relationship
  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
