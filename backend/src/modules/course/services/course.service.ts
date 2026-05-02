import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import {
  createCourseSchema,
  updateCourseSchema,
  courseSchema,
} from '../schema/course.schema';
import { CreateCourseInput, UpdateCourseInput } from '../types/course.types';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async findAll() {
    const courses = await this.courseRepository.findMany();
    return courses.map((course) => courseSchema.parse(course));
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return courseSchema.parse(course);
  }

  async create(payload: CreateCourseInput, mentorId: string) {
    const parsed = createCourseSchema.parse(payload);
    const created = await this.courseRepository.createAndSave({
      ...parsed,
      mentorId,
    });
    return courseSchema.parse(created);
  }

  async update(id: string, payload: UpdateCourseInput) {
    const parsed = updateCourseSchema.parse(payload);
    const updated = await this.courseRepository.updateById(id, parsed);
    return courseSchema.parse(updated);
  }

  async remove(id: string) {
    await this.courseRepository.softDeleteById(id);
  }
}
