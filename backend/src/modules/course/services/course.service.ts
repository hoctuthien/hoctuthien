import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import {
  createCourseSchema,
  updateCourseSchema,
  courseSchema,
} from '../schema/course.schema';
import { CreateCourseInput, UpdateCourseInput } from '../types/course.types';
import { DataSource } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { CourseCategoryEntity } from '../../course-category/entities/course-category.entity';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly dataSource: DataSource,
  ) {}

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
    const { categoryIds, ...courseData } = createCourseSchema.parse(payload);

    return this.dataSource.transaction(async (manager) => {
      // 1. Create Course
      const course = manager.create(CourseEntity, {
        ...courseData,
        mentorId,
      });
      const savedCourse = await manager.save(CourseEntity, course);

      // 2. Create Course Category associations if provided
      if (categoryIds && categoryIds.length > 0) {
        const courseCategories = categoryIds.map((categoryId) =>
          manager.create(CourseCategoryEntity, {
            courseId: savedCourse.id,
            categoryId,
          }),
        );
        await manager.save(CourseCategoryEntity, courseCategories);
      }

      return courseSchema.parse(savedCourse);
    });
  }

  async update(id: string, payload: UpdateCourseInput) {
    const { categoryIds, ...courseData } = updateCourseSchema.parse(payload);

    return this.dataSource.transaction(async (manager) => {
      // 1. Update Course
      const course = await manager.findOne(CourseEntity, { where: { id } });
      if (!course) throw new NotFoundException('Course not found');

      Object.assign(course, courseData);
      const updatedCourse = await manager.save(CourseEntity, course);

      // 2. Update Course Category associations if provided
      if (categoryIds) {
        // Remove old associations
        await manager.delete(CourseCategoryEntity, { courseId: id });

        // Add new associations
        if (categoryIds.length > 0) {
          const courseCategories = categoryIds.map((categoryId) =>
            manager.create(CourseCategoryEntity, {
              courseId: id,
              categoryId,
            }),
          );
          await manager.save(CourseCategoryEntity, courseCategories);
        }
      }

      return courseSchema.parse(updatedCourse);
    });
  }

  async remove(id: string) {
    await this.courseRepository.softDeleteById(id);
  }
}
