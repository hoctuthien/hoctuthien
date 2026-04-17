import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'conversations' })
export class ConversationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
