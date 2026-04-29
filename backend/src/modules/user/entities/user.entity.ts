import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  MENTEE = 'mentee',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  googleId: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  phone: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'day_of_birth', type: 'date', nullable: true })
  dayOfBirth: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC', nullable: true })
  timezone: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MENTEE,
  })
  role: UserRole;

  @Column({ type: 'integer', default: 0, nullable: true })
  points: number | null;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isVerified: boolean | null;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  preferences: Record<string, any> | null;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, default: 'active', nullable: true })
  status: string | null;
}
