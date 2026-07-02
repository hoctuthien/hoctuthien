import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum OtpPurpose {
  PASSWORD_RESET = 'password_reset',
}

@Entity({ name: 'otp_tokens' })
@Index(['email', 'purpose', 'consumedAt', 'expiresAt'])
export class OtpTokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
  })
  purpose: OtpPurpose;

  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  metadata: Record<string, any> | null;
}
