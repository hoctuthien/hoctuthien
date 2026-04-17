import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'black-lists' })
export class BlackListEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
