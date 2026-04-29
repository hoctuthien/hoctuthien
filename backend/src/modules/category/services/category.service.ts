import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import {
  createCategorySchema,
  updateCategorySchema,
  categorySchema,
} from '../schema/category.schema';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category.types';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll() {
    const items = await this.categoryRepository.findMany();
    return items.map((item) => categorySchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.categoryRepository.findById(id);
    if (!item) throw new NotFoundException('Category not found');
    return categorySchema.parse(item);
  }

  async create(payload: CreateCategoryInput) {
    const parsed = createCategorySchema.parse(payload);
    const created = await this.categoryRepository.createAndSave(parsed);
    return categorySchema.parse(created);
  }

  async update(id: string, payload: UpdateCategoryInput) {
    const parsed = updateCategorySchema.parse(payload);
    const updated = await this.categoryRepository.updateById(id, parsed);
    return categorySchema.parse(updated);
  }

  async remove(id: string) {
    await this.categoryRepository.softDeleteById(id);
  }
}
