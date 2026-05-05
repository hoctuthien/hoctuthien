import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseBookingRepository } from '../repositories/course-booking.repository';
import {
  createCourseBookingSchema,
  updateCourseBookingSchema,
  updateCourseBookingByMenteeSchema,
  findCourseBookingsQuerySchema,
  courseBookingSchema,
} from '../schema/course-booking.schema';
import {
  CreateCourseBookingInput,
  UpdateCourseBookingInput,
  UpdateCourseBookingByMenteeInput,
  FindCourseBookingsQuery,
} from '../types/course-booking.types';
import { Role } from '../../../common/enums/role.enum';
import { CourseRepository } from '../../course/repositories/course.repository';

@Injectable()
export class CourseBookingService {
  constructor(
    private readonly courseBookingRepository: CourseBookingRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async findAll(
    query: FindCourseBookingsQuery,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const { courseId, menteeId, status, page, limit } =
      findCourseBookingsQuerySchema.parse(query);

    const where: Record<string, any> = {};

    if (requestingUserRole === Role.MENTEE) {
      // MENTEE chỉ thấy booking của chính mình
      where['menteeId'] = requestingUserId;
    } else if (requestingUserRole === Role.MENTOR) {
      // MENTOR chỉ thấy booking thuộc các course của mình
      const myCourses = await this.courseRepository.findMany({
        where: { mentorId: requestingUserId },
        select: ['id'],
      });
      const myCourseIds = myCourses.map((c) => c.id);
      if (myCourseIds.length === 0) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }
      const [items, total] = await this.courseBookingRepository.findByCourseIds(
        myCourseIds,
        {
          where: {
            ...(courseId ? { courseId } : {}),
            ...(menteeId ? { menteeId } : {}),
            ...(status ? { status } : {}),
          },
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        },
      );
      return {
        data: items.map((item) => courseBookingSchema.parse(item)),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }
    // ADMIN thấy tất cả — áp dụng filter từ query
    if (courseId) where['courseId'] = courseId;
    if (menteeId) where['menteeId'] = menteeId;
    if (status) where['status'] = status;

    const [items, total] = await this.courseBookingRepository.findManyWithCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: items.map((item) => courseBookingSchema.parse(item)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(
    id: string,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course booking not found');

    if (requestingUserRole === Role.MENTEE && item.menteeId !== requestingUserId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này.');
    }

    if (requestingUserRole === Role.MENTOR) {
      const course = await this.courseRepository.findById(item.courseId);
      if (!course || course.mentorId !== requestingUserId) {
        throw new ForbiddenException('Bạn không có quyền xem booking này.');
      }
    }

    return courseBookingSchema.parse(item);
  }

  // menteeId lấy từ JWT, không để client tự truyền
  async create(payload: CreateCourseBookingInput, menteeId: string) {
    const parsed = createCourseBookingSchema.parse(payload);
    const created = await this.courseBookingRepository.createAndSave({
      ...parsed,
      menteeId,
    });
    return courseBookingSchema.parse(created);
  }

  // MENTEE chỉ được cập nhật notes/cancel
  async updateByMentee(
    id: string,
    payload: UpdateCourseBookingByMenteeInput,
    menteeId: string,
  ) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course booking not found');
    if (item.menteeId !== menteeId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật booking này.');
    }

    const parsed = updateCourseBookingByMenteeSchema.parse(payload);
    const updated = await this.courseBookingRepository.updateById(id, parsed);
    return courseBookingSchema.parse(updated);
  }

  // MENTOR/ADMIN được cập nhật đầy đủ
  async update(
    id: string,
    payload: UpdateCourseBookingInput,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course booking not found');

    if (requestingUserRole === Role.MENTOR) {
      const course = await this.courseRepository.findById(item.courseId);
      if (!course || course.mentorId !== requestingUserId) {
        throw new ForbiddenException('Bạn không có quyền cập nhật booking này.');
      }
    }

    const parsed = updateCourseBookingSchema.parse(payload);
    const updated = await this.courseBookingRepository.updateById(id, parsed);
    return courseBookingSchema.parse(updated);
  }

  async remove(
    id: string,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course booking not found');

    if (
      requestingUserRole !== Role.ADMIN &&
      item.menteeId !== requestingUserId
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa booking này.');
    }

    await this.courseBookingRepository.softDeleteById(id);
  }
}
