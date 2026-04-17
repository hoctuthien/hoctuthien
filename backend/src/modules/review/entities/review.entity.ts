import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'reviews' })
export class ReviewEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
