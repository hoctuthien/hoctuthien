import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'system_config' })
export class SystemConfigEntity extends BaseEntity {
  @Column({ name: 'config_key', type: 'varchar', length: 255, unique: true })
  configKey: string;

  @Column({ name: 'config_value', type: 'jsonb' })
  configValue: any;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity | null;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
