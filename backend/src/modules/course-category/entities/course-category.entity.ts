import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { CategoryEntity } from '../../category/entities/category.entity';

@Entity({ name: 'course_categories' })
@Unique(['courseId', 'categoryId'])
export class CourseCategoryEntity extends BaseEntity {
  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
