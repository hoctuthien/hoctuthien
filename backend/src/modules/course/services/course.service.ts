import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import {
  createCourseSchema,
  updateCourseSchema,
  approveCourseSchema,
  courseSchema,
} from '../schema/course.schema';
import {
  CreateCourseInput,
  UpdateCourseInput,
  ApproveCourseInput,
} from '../types/course.types';
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

  async update(id: string, payload: UpdateCourseInput, mentorId: string) {
    const { categoryIds, ...courseData } = updateCourseSchema.parse(payload);

    return this.dataSource.transaction(async (manager) => {
      // 1. Update Course - kiểm tra ownership
      const course = await manager.findOne(CourseEntity, { where: { id } });
      if (!course) throw new NotFoundException('Course not found');

      if (course.mentorId !== mentorId) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật khóa học của người khác.',
        );
      }

      Object.assign(course, courseData);
      const updatedCourse = await manager.save(CourseEntity, course);

      // 2. Update Course Category associations if provided
      if (categoryIds) {
        // Soft delete tất cả liên kết cũ
        await manager.softDelete(CourseCategoryEntity, { courseId: id });

        // Tạo mới hoặc restore nếu liên kết đã từng tồn tại (soft-deleted)
        if (categoryIds.length > 0) {
          for (const categoryId of categoryIds) {
            const existing = await manager.findOne(CourseCategoryEntity, {
              where: { courseId: id, categoryId },
              withDeleted: true,
            });

            if (existing) {
              // Restore record đã soft-delete thay vì insert mới (tránh unique constraint)
              await manager.restore(CourseCategoryEntity, existing.id);
            } else {
              const link = manager.create(CourseCategoryEntity, {
                courseId: id,
                categoryId,
              });
              await manager.save(CourseCategoryEntity, link);
            }
          }
        }
      }

      return courseSchema.parse(updatedCourse);
    });
  }

  async approve(id: string, payload: ApproveCourseInput) {
    const parsed = approveCourseSchema.parse(payload);

    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');

    const updated = await this.courseRepository.updateById(id, {
      approvedBy: parsed.approvedBy,
      status: parsed.status,
    });

    return courseSchema.parse(updated);
  }

  async remove(id: string, mentorId: string) {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');

    if (course.mentorId !== mentorId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa khóa học của người khác.',
      );
    }

    await this.courseRepository.softDeleteById(id);
  }
}
