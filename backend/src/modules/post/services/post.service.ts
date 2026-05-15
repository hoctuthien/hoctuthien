import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostEntity } from '../entities/post.entity';
import { DeepPartial } from 'typeorm';
import { PostStatus } from '../enums/post-status.enum';

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

  async findAll(): Promise<PostEntity[]> {
    return this.postRepository.findMany({
      relations: ['author', 'category', 'coverImage', 'postTags', 'postTags.tag'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PostEntity> {
    const post = await this.postRepository.findById(id, {
      relations: ['author', 'category', 'coverImage', 'postTags', 'postTags.tag'],
    });

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
