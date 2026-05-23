import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CategoryStatus } from '../enums/category-status.enum';
import { GroupCategoryEntity } from '../../group-category/entities/group-category.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    default: CategoryStatus.ACTIVE,
  })
  status: string;

  @Column({ name: 'group_category_id', type: 'uuid', nullable: true })
  groupCategoryId: string | null;

  @ManyToOne(() => GroupCategoryEntity, (group) => group.categories, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'group_category_id' })
  groupCategory: GroupCategoryEntity;
}

