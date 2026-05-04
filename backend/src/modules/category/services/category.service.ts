import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ILike } from 'typeorm';
import { CategoryRepository } from '../repositories/category.repository';
import {
  createCategorySchema,
  updateCategorySchema,
  findCategoriesQuerySchema,
  categorySchema,
} from '../schema/category.schema';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  FindCategoriesQuery,
} from '../types/category.types';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(query: FindCategoriesQuery) {
    const { name, slug, status, page, limit } =
      findCategoriesQuerySchema.parse(query);

    const where: Record<string, any> = {};
    if (name) where['name'] = ILike(`%${name}%`);
    if (slug) where['slug'] = ILike(`%${slug}%`);
    if (status) where['status'] = status;

    const [items, total] = await this.categoryRepository.findManyWithCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: items.map((item) => categorySchema.parse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.categoryRepository.findById(id);
    if (!item) throw new NotFoundException('Category not found');
    return categorySchema.parse(item);
  }

  async create(payload: CreateCategoryInput) {
    const parsed = createCategorySchema.parse(payload);

    // Kiểm tra slug trùng nếu có
    if (parsed.slug) {
      const existing = await this.categoryRepository.exists({
        slug: parsed.slug,
      });
      if (existing) {
        throw new ConflictException(
          `Slug "${parsed.slug}" đã tồn tại. Vui lòng chọn slug khác.`,
        );
      }
    }

    const created = await this.categoryRepository.createAndSave(parsed);
    return categorySchema.parse(created);
  }

  async update(id: string, payload: UpdateCategoryInput) {
    const parsed = updateCategorySchema.parse(payload);

    // Kiểm tra slug trùng nếu đổi slug
    if (parsed.slug) {
      const existing = await this.categoryRepository.findOne({ slug: parsed.slug });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Slug "${parsed.slug}" đã tồn tại. Vui lòng chọn slug khác.`,
        );
      }
    }

    const updated = await this.categoryRepository.updateById(id, parsed);
    return categorySchema.parse(updated);
  }

  async remove(id: string) {
    await this.categoryRepository.softDeleteById(id);
  }
}
