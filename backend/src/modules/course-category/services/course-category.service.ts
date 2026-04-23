import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseCategoryRepository } from '../repositories/course-category.repository';
import {
  createCourseCategorySchema,
  updateCourseCategorySchema,
  courseCategorySchema,
} from '../schema/course-category.schema';
import {
  CreateCourseCategoryInput,
  UpdateCourseCategoryInput,
} from '../types/course-category.types';

@Injectable()
export class CourseCategoryService {
  constructor(private readonly courseCategoryRepository: CourseCategoryRepository) {}

  async findAll() {
    const items = await this.courseCategoryRepository.findMany();
    return items.map(item => courseCategorySchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.courseCategoryRepository.findById(id);
    if (!item) throw new NotFoundException('Course category link not found');
    return courseCategorySchema.parse(item);
  }

  async create(payload: CreateCourseCategoryInput) {
    const parsed = createCourseCategorySchema.parse(payload);
    const created = await this.courseCategoryRepository.createAndSave(parsed);
    return courseCategorySchema.parse(created);
  }

  async update(id: string, payload: UpdateCourseCategoryInput) {
    const parsed = updateCourseCategorySchema.parse(payload);
    const updated = await this.courseCategoryRepository.updateById(id, parsed);
    return courseCategorySchema.parse(updated);
  }

  async remove(id: string) {
    await this.courseCategoryRepository.softDeleteById(id);
  }
}
