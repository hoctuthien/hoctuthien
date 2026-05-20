import { Injectable, ConflictException } from '@nestjs/common';
import { TagRepository } from '../repositories/tag.repository';
import { TagEntity } from '../entities/tag.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  /**
   * Auto-generate slug từ name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (await this.tagRepository.findOne({ slug: uniqueSlug } as any)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(data: DeepPartial<TagEntity>): Promise<TagEntity> {
    // Auto-generate slug nếu chưa có
    if (!data.slug && data.name) {
      const baseSlug = this.generateSlug(data.name as string);
      data.slug = await this.ensureUniqueSlug(baseSlug);
    }

    return this.tagRepository.createAndSave(data);
  }

  async findAll(): Promise<TagEntity[]> {
    return this.tagRepository.findMany({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TagEntity> {
    return this.tagRepository.findByIdOrFail(id);
  }

  async update(id: string, data: DeepPartial<TagEntity>): Promise<TagEntity> {
    return this.tagRepository.updateById(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.tagRepository.softDeleteById(id);
  }
}
