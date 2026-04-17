import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
