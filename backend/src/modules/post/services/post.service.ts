import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostEntity } from '../entities/post.entity';
import { DeepPartial } from 'typeorm';
import { PostStatus } from '../enums/post-status.enum';
import { FindAllPostsDto } from '../dto/find-all-posts.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  /**
   * Tạo slug từ title
   * Ví dụ: "Modern UI Design Trends" → "modern-ui-design-trends"
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-') // Gộp nhiều dấu gạch ngang
      .replace(/^-|-$/g, ''); // Bỏ dấu gạch ngang đầu/cuối
  }

  /**
   * Đảm bảo slug là duy nhất bằng cách thêm hậu tố nếu bị trùng
   */
  private async ensureUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (await this.postRepository.findOne({ slug: uniqueSlug } as any)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(
    data: DeepPartial<PostEntity>,
    authorId: string,
  ): Promise<PostEntity> {
    // Auto-generate slug từ title
    const baseSlug = this.generateSlug(data.title as string);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Auto-set publishedAt nếu status là published
    const publishedAt =
      data.status === PostStatus.PUBLISHED ? new Date() : null;

    return this.postRepository.createAndSave({
      ...data,
      slug,
      authorId,
      publishedAt,
    });
  }

  async findAll(query?: FindAllPostsDto): Promise<PostEntity[]> {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.coverImage', 'coverImage')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .orderBy('post.createdAt', 'DESC');

    if (query?.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    
    if (query?.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: query.categorySlug });
    }

    if (query?.tagId || query?.tagSlug) {
      // Sử dụng subquery để tìm các bài viết có tag tương ứng
      qb.andWhere((qbSub) => {
        const subQuery = qbSub.subQuery()
          .select('pt.post_id')
          .from('post_tags', 'pt')
          .innerJoin('tags', 't', 't.id = pt.tag_id');
        
        if (query.tagId) {
          subQuery.where('t.id = :tagId', { tagId: query.tagId });
        } else if (query.tagSlug) {
          subQuery.where('t.slug = :tagSlug', { tagSlug: query.tagSlug });
        }
        
        return 'post.id IN ' + subQuery.getQuery();
      });
      
      // Đặt parameter cho subquery vì subQuery.where không tự động bind vào qb chính trong một số trường hợp
      if (query.tagId) qb.setParameter('tagId', query.tagId);
      if (query.tagSlug) qb.setParameter('tagSlug', query.tagSlug);
    }

    if (query?.search) {
      qb.andWhere('post.title ILIKE :search', { search: `%${query.search}%` });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<PostEntity> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let post: PostEntity | null = null;

    if (isUuid) {
      post = await this.postRepository.findById(id, {
        relations: ['author', 'category', 'coverImage', 'postTags', 'postTags.tag'],
      });
    } else {
      post = await this.postRepository.findOne(
        { slug: id } as any,
        {
          relations: ['author', 'category', 'coverImage', 'postTags', 'postTags.tag'],
        },
      );
    }

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    data: DeepPartial<PostEntity>,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findByIdOrFail(id, 'Post not found');

    // Nếu title thay đổi thì cập nhật slug
    if (data.title && data.title !== post.title) {
      const baseSlug = this.generateSlug(data.title as string);
      data.slug = await this.ensureUniqueSlug(baseSlug);
    }

    // Auto-set publishedAt khi chuyển sang published
    if (data.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    Object.assign(post, data);
    return this.postRepository.createAndSave(post);
  }

  async remove(id: string): Promise<void> {
    return this.postRepository.softDeleteById(id);
  }
}
