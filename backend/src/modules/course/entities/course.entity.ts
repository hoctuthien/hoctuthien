import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'courses' })
export class CourseEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
