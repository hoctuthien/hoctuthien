import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  googleId?: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash?: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  phone?: string | null;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatarUrl?: string | null;

  @Column({ name: 'day_of_birth', type: 'date', nullable: true })
  dayOfBirth?: string | null;

  @Column({ name: 'gender', type: 'varchar', length: 50, nullable: true })
  gender?: string | null;

  @Column({ name: 'timezone', type: 'varchar', length: 50, nullable: true })
  timezone?: string | null;

  @Column({ name: 'role', type: 'varchar', length: 50, default: 'mentee' })
  role: string = 'mentee';

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number = 0;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean = false;

  @Column({ name: 'preferences', type: 'jsonb', nullable: true })
  preferences?: Record<string, unknown> | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'active' })
  status: string ;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshTokenHash?: string | null;
}
