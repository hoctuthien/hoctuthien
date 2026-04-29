import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseReviewRepository } from '../repositories/course-review.repository';
import {
  createCourseReviewSchema,
  updateCourseReviewSchema,
  courseReviewSchema,
} from '../schema/course-review.schema';
import {
  CreateCourseReviewInput,
  UpdateCourseReviewInput,
} from '../types/course-review.types';

@Injectable()
export class CourseReviewService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
  ) {}

  async findAll() {
    const items = await this.courseReviewRepository.findMany();
    return items.map((item) => courseReviewSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.courseReviewRepository.findById(id);
    if (!item) throw new NotFoundException('Course Review not found');
    return courseReviewSchema.parse(item);
  }

  async create(payload: CreateCourseReviewInput) {
    const parsed = createCourseReviewSchema.parse(payload);
    const created = await this.courseReviewRepository.createAndSave(parsed);
    return courseReviewSchema.parse(created);
  }

  async update(id: string, payload: UpdateCourseReviewInput) {
    const parsed = updateCourseReviewSchema.parse(payload);
    const updated = await this.courseReviewRepository.updateById(id, parsed);
    return courseReviewSchema.parse(updated);
  }

  async remove(id: string) {
    await this.courseReviewRepository.softDeleteById(id);
  }
}
