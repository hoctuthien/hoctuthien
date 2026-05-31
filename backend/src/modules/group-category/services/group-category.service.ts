import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ILike } from 'typeorm';
import { GroupCategoryRepository } from '../repositories/group-category.repository';
import {
  createGroupCategorySchema,
  updateGroupCategorySchema,
  findGroupCategoriesQuerySchema,
  groupCategorySchema,
} from '../schema/group-category.schema';
import {
  CreateGroupCategoryInput,
  UpdateGroupCategoryInput,
  FindGroupCategoriesQuery,
} from '../types/group-category.types';

@Injectable()
export class GroupCategoryService {
  constructor(
    private readonly groupCategoryRepository: GroupCategoryRepository,
  ) {}

  async findAll(query: FindGroupCategoriesQuery) {
    const { name, slug, status, page, limit } =
      findGroupCategoriesQuerySchema.parse(query);

    const where: Record<string, any> = {};
    if (name) where['name'] = ILike(`%${name}%`);
    if (slug) where['slug'] = ILike(`%${slug}%`);
    if (status) where['status'] = status;

    const [items, total] = await this.groupCategoryRepository.findManyWithCount(
      {
        where,
        relations: ['categories'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return {
      data: items.map((item) => groupCategorySchema.parse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.groupCategoryRepository.findOne(
      { id },
      { relations: ['categories'] },
    );
    if (!item) throw new NotFoundException('Group Category not found');
    return groupCategorySchema.parse(item);
  }

  async create(payload: CreateGroupCategoryInput) {
    const parsed = createGroupCategorySchema.parse(payload);

    if (parsed.slug) {
      const existing = await this.groupCategoryRepository.exists({
        slug: parsed.slug,
      });
      if (existing) {
        throw new ConflictException(
          `Slug "${parsed.slug}" đã tồn tại. Vui lòng chọn slug khác.`,
        );
      }
    }

    const created = await this.groupCategoryRepository.createAndSave(parsed);
    return groupCategorySchema.parse(created);
  }

  async update(id: string, payload: UpdateGroupCategoryInput) {
    const parsed = updateGroupCategorySchema.parse(payload);

    if (parsed.slug) {
      const existing = await this.groupCategoryRepository.findOne({
        slug: parsed.slug,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Slug "${parsed.slug}" đã tồn tại. Vui lòng chọn slug khác.`,
        );
      }
    }

    const updated = await this.groupCategoryRepository.updateById(id, parsed);
    return groupCategorySchema.parse(updated);
  }

  async remove(id: string) {
    await this.groupCategoryRepository.softDeleteById(id);
  }
}
