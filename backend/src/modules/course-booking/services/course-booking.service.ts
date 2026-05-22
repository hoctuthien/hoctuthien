import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Not } from 'typeorm';
import { CourseBookingRepository } from '../repositories/course-booking.repository';
import { BookingStatus } from '../entities/course-booking.entity';
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

    const [items, total] = await this.courseBookingRepository.findManyWithCount(
      {
        where,
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

  async findOne(
    id: string,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course booking not found');

    if (
      requestingUserRole === Role.MENTEE &&
      item.menteeId !== requestingUserId
    ) {
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

    // Validate meeting time against course metadata
    const course = await this.courseRepository.findById(parsed.courseId);
    if (!course) throw new NotFoundException('Course not found');

    this.validateMeetingTime(parsed.meetingTime, course.metadata);

    // Kiểm tra trùng lặp: Mỗi khóa học chỉ cho phép tối đa một học viên đăng ký hoạt động
    const existingActiveBooking = await this.courseBookingRepository.findOne({
      courseId: parsed.courseId,
      status: Not(BookingStatus.CANCELLED),
    });

    if (existingActiveBooking) {
      throw new BadRequestException(
        'Khóa học này đã có học viên đăng ký và đang hoạt động.',
      );
    }

    // Tạm thời luồng payment tự động thành công (confirmed)
    const created = await this.courseBookingRepository.createAndSave({
      ...parsed,
      menteeId,
      status: BookingStatus.CONFIRMED,
    });
    return courseBookingSchema.parse(created);
  }

  private validateMeetingTime(meetingTime: Date, metadata: any) {
    if (!metadata?.time) {
      // Nếu không có config time trong metadata, coi như flexible hoàn toàn
      return;
    }

    const dayOfWeek = meetingTime
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    const hours = meetingTime.getHours().toString().padStart(2, '0');
    const minutes = meetingTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const slots = metadata.time[dayOfWeek];

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      throw new BadRequestException(
        `Mentor không rảnh vào thứ ${dayOfWeek}. Vui lòng chọn ngày khác.`,
      );
    }

    const isInRange = slots.some((range: string) =>
      this.isTimeInRange(timeStr, range),
    );

    if (!isInRange) {
      throw new BadRequestException(
        `Thời gian ${timeStr} không nằm trong khung giờ rảnh của Mentor vào ${dayOfWeek} (${slots.join(
          ', ',
        )}).`,
      );
    }
  }

  private isTimeInRange(time: string, range: string): boolean {
    try {
      const [start, end] = range.split('-');
      if (!start || !end) return false;

      const [timeH, timeM] = time.split(':').map(Number);
      const [startH, startM] = start.trim().split(':').map(Number);
      const [endH, endM] = end.trim().split(':').map(Number);

      const timeVal = timeH * 60 + timeM;
      const startVal = startH * 60 + startM;
      const endVal = endH * 60 + endM;

      return timeVal >= startVal && timeVal <= endVal;
    } catch (e) {
      return false;
    }
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
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật booking này.',
        );
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
