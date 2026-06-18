import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CategoryEntity } from '../../category/entities/category.entity';
import { MediaEntity } from '../../media/entities/media.entity';
import { PostStatus } from '../enums/post-status.enum';
import { PostTagEntity } from './post-tag.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'jsonb', default: {} })
  content: any; // BlockNote JSON

  @Column({ name: 'content_text', type: 'text', nullable: true })
  contentText: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity | null;

  @Column({ name: 'cover_image_id', type: 'uuid', nullable: true })
  coverImageId: string | null;

  @ManyToOne(() => MediaEntity)
  @JoinColumn({ name: 'cover_image_id' })
  coverImage: MediaEntity | null;

  @Column({
    name: 'published_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => PostTagEntity, (postTag) => postTag.post)
  postTags: PostTagEntity[];
}
