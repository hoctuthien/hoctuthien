import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AppLogger } from '../../../common/logger/app-logger.service';
import { CourseRepository } from '../repositories/course.repository';
import {
  CreateCourseInput,
  UpdateCourseInput,
  ApproveCourseInput,
} from '../types/course.types';
import { DataSource, ILike, In } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { CourseCategoryEntity } from '../../course-category/entities/course-category.entity';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';
import { SystemConfigEntity } from '../../system-config/entities/system-config.entity';
import { CategoryEntity } from '../../category/entities/category.entity';
import { CourseStatus } from '../enums/course-status.enum';
import { COURSE_MESSAGES } from '../../../common/constants/message.constant';
import {
  approveCourseSchema,
  courseSchema,
  updateCourseSchema,
  findCoursesQuerySchema,
  FindCoursesQuery,
} from '../schema/course.schema';
import { createPaginationMeta } from '../../../common/utils/pagination.util';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CourseService.name);
  }

  async findAll(query: FindCoursesQuery, userRole?: string, userId?: string) {
    this.logger.debug({ query, userRole, userId }, 'findAll -> entry');
    const { title, status, mentorId, groupCategoryId, groupCategorySlug, categoryId, categorySlug, page, limit } =
      findCoursesQuerySchema.parse(query);

    const where: Record<string, any> = {};
    if (title) where['title'] = ILike(`%${title}%`);
    if (status) where['status'] = status;
    if (mentorId) where['mentorId'] = mentorId;

    if (groupCategoryId || groupCategorySlug || categoryId || categorySlug) {
      const categoryWhere: Record<string, any> = {};
      if (groupCategoryId) categoryWhere['groupCategoryId'] = groupCategoryId;
      if (groupCategorySlug) categoryWhere['groupCategory'] = { slug: groupCategorySlug };
      if (categoryId) categoryWhere['id'] = categoryId;
      if (categorySlug) categoryWhere['slug'] = categorySlug;

      const categories = await this.dataSource.getRepository(CategoryEntity).find({
        where: categoryWhere,
        select: ['id'],
      });
      const categoryIds = categories.map((c) => c.id);

      if (categoryIds.length > 0) {
        const courseCategories = await this.dataSource.getRepository(CourseCategoryEntity).find({
          where: { categoryId: In(categoryIds) },
          select: ['courseId'],
        });
        const courseIds = courseCategories.map((cc) => cc.courseId);

        if (courseIds.length > 0) {
          where['id'] = In(courseIds);
        } else {
          where['id'] = In(['00000000-0000-0000-0000-000000000000']);
        }
      } else {
        where['id'] = In(['00000000-0000-0000-0000-000000000000']);
      }
    }

    const isAdmin = userRole === 'admin';
    const isOwnMentorQuery = mentorId && userId && mentorId === userId;

    if (!isAdmin && !isOwnMentorQuery) {
      // Hiển thị tất cả khoá học ACTIVE (không bắt buộc phải có approvedBy)
      where['status'] = CourseStatus.ACTIVE;
    }

    const [items, total] = await this.courseRepository.findManyWithCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((course) => courseSchema.parse(course)),
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    this.logger.debug({ courseId: id }, 'findOne -> entry');
    const course = await this.courseRepository.findById(id);
    if (!course) {
      this.logger.debug({ courseId: id, error: 'Not found' }, 'findOne -> error');
      throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);
    }
    this.logger.debug({ courseId: id, found: true }, 'findOne -> done');
    return courseSchema.parse(course);
  }

  async create(payload: CreateCourseInput, mentorId: string) {
    this.logger.debug({ mentorId, title: payload.title }, 'create -> entry');
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

      // 3. Tạo khóa học — tự động set approvedBy = mentorId (auto-approve)
      const newCourse = manager.create(CourseEntity, {
        ...courseData,
        durationMinutes: duration,
        mentorId,
        approvedBy: mentorId,
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
    this.logger.debug({ courseId: id, mentorId }, 'update -> entry');
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
    this.logger.debug({ courseId: id, mentorId, status }, 'updateStatus -> entry');
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
    this.logger.debug({ courseId: id, payload }, 'approve -> entry');
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
    this.logger.debug({ courseId: id, mentorId }, 'remove -> entry');
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException(COURSE_MESSAGES.COURSE_NOT_FOUND);

    if (course.mentorId !== mentorId) {
      throw new ForbiddenException(COURSE_MESSAGES.UNAUTHORIZED_UPDATE);
    }

    await this.courseRepository.softDeleteById(id);
  }
}
