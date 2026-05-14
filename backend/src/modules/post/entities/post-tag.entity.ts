import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { TagEntity } from '../../tag/entities/tag.entity';

@Entity({ name: 'post_tags' })
export class PostTagEntity {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @PrimaryColumn({ name: 'tag_id', type: 'uuid' })
  tagId: string;

  @ManyToOne(() => PostEntity, (post) => post.postTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;
}
