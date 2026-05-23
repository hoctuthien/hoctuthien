import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CategoryEntity } from '../../category/entities/category.entity';

@Entity({ name: 'group_categories' })
export class GroupCategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => CategoryEntity, (category) => category.groupCategory)
  categories: CategoryEntity[];
}
