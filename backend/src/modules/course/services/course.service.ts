import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import {
  CreateCourseInput,
  UpdateCourseInput,
  ApproveCourseInput,
} from '../types/course.types';
import { DataSource } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { CourseCategoryEntity } from '../../course-category/entities/course-category.entity';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';
import { SystemConfigEntity } from '../../system-config/entities/system-config.entity';
import { CourseStatus } from '../enums/course-status.enum';
import { COURSE_MESSAGES } from '../../../common/constants/message.constant';
import {
  approveCourseSchema,
  courseSchema,
  updateCourseSchema,
} from '../schema/course.schema';

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
    if (!course) throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);
    return courseSchema.parse(course);
  }

  async create(payload: CreateCourseInput, mentorId: string) {
    const { durationMinutes, categoryIds, ...courseData } = payload;
    const duration = durationMinutes || 60;

    return this.dataSource.transaction(async (manager) => {
      // 1. Kiểm tra Mentor đã có profile approved chưa
      const mentorProfile = await manager.findOne(MentorProfileEntity, {
        where: { userId: mentorId },
      });

      if (!mentorProfile || !mentorProfile.isApproved) {
        throw new ForbiddenException(COURSE_MESSAGES.INVALID_MENTOR_PROFILE);
      }

      // 2. Validate duration_minutes trong system_config whitelist
      const config = await manager.findOne(SystemConfigEntity, {
        where: { configKey: 'course_duration_whitelist' },
      });
      if (config && Array.isArray(config.configValue)) {
        if (!config.configValue.includes(duration)) {
          throw new BadRequestException(COURSE_MESSAGES.INVALID_DURATION);
        }
      }

      // 3. Tạo khóa học (status mặc định = ACTIVE)
      const newCourse = manager.create(CourseEntity, {
        ...courseData,
        durationMinutes: duration,
        mentorId,
        status: CourseStatus.ACTIVE,
      });

      const savedCourse = await manager.save(CourseEntity, newCourse);

      // 4. Tạo mapping categories nếu có
      if (categoryIds && categoryIds.length > 0) {
        const categoryLinks = categoryIds.map((categoryId) =>
          manager.create(CourseCategoryEntity, {
            courseId: savedCourse.id,
            categoryId,
          }),
        );
        await manager.save(CourseCategoryEntity, categoryLinks);
      }

      return courseSchema.parse(savedCourse);
    });
  }

  async update(id: string, payload: UpdateCourseInput, mentorId: string) {
    const { categoryIds, durationMinutes, ...courseData } =
      updateCourseSchema.parse(payload);

    return this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(CourseEntity, { where: { id } });
      if (!course)
        throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);

      if (course.mentorId !== mentorId) {
        throw new ForbiddenException(COURSE_MESSAGES.UNAUTHORIZED_UPDATE);
      }

      if (durationMinutes !== undefined) {
        const config = await manager.findOne(SystemConfigEntity, {
          where: { configKey: 'course_duration_whitelist' },
        });
        if (config && Array.isArray(config.configValue)) {
          if (!config.configValue.includes(durationMinutes)) {
            throw new BadRequestException(COURSE_MESSAGES.INVALID_DURATION);
          }
        }
        course.durationMinutes = durationMinutes;
      }

      Object.assign(course, courseData);
      const updatedCourse = await manager.save(CourseEntity, course);

      if (categoryIds) {
        await manager.softDelete(CourseCategoryEntity, { courseId: id });

        if (categoryIds.length > 0) {
          for (const categoryId of categoryIds) {
            const existing = await manager.findOne(CourseCategoryEntity, {
              where: { courseId: id, categoryId },
              withDeleted: true,
            });

            if (existing) {
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

  async updateStatus(
    id: string,
    mentorId: string,
    status: CourseStatus.ACTIVE | CourseStatus.INACTIVE,
  ) {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);

    if (course.mentorId !== mentorId) {
      throw new ForbiddenException(COURSE_MESSAGES.UNAUTHORIZED_UPDATE);
    }

    if (
      course.status !== CourseStatus.ACTIVE &&
      course.status !== CourseStatus.INACTIVE
    ) {
      throw new BadRequestException(COURSE_MESSAGES.INVALID_STATUS_TOGGLE);
    }

    const updated = await this.courseRepository.updateById(id, { status });
    return courseSchema.parse(updated);
  }

  async approve(id: string, payload: ApproveCourseInput) {
    const parsed = approveCourseSchema.parse(payload);

    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);

    const updated = await this.courseRepository.updateById(id, {
      approvedBy: parsed.approvedBy,
      status: parsed.status,
    });

    return courseSchema.parse(updated);
  }

  async remove(id: string, mentorId: string) {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);

    if (course.mentorId !== mentorId) {
      throw new ForbiddenException(COURSE_MESSAGES.UNAUTHORIZED_UPDATE);
    }

    await this.courseRepository.softDeleteById(id);
  }
}
