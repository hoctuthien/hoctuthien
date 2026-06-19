import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
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
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class CourseBookingService {
  private readonly logger = new Logger(CourseBookingService.name);

  constructor(
    private readonly courseBookingRepository: CourseBookingRepository,
    private readonly courseRepository: CourseRepository,
    private readonly mailService: MailService,
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
          relations: ['course', 'course.mentor', 'mentee'],
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
        relations: ['course', 'course.mentor', 'mentee'],
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
    const item = await this.courseBookingRepository.findById(id, {
      relations: ['course', 'course.mentor', 'mentee'],
    });
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

  async checkConflict(meetingTime: Date, courseId: string, menteeId: string) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    const mentorId = course.mentorId;
    const duration = course.durationMinutes || 60;

    const proposedStart = new Date(meetingTime);
    const proposedEnd = new Date(
      proposedStart.getTime() + duration * 60 * 1000,
    );

    // 1. Check Mentee conflicts
    const menteeBookings = await this.courseBookingRepository.findMany({
      where: {
        menteeId,
        status: Not(BookingStatus.CANCELLED),
      },
      relations: ['course'],
    });

    for (const booking of menteeBookings) {
      const bookingStart = new Date(booking.meetingTime);
      const bookingDuration = booking.course?.durationMinutes || 60;
      const bookingEnd = new Date(
        bookingStart.getTime() + bookingDuration * 60 * 1000,
      );

      if (proposedStart < bookingEnd && bookingStart < proposedEnd) {
        return {
          hasConflict: true,
          conflictType: 'mentee',
          message: `Lịch học bị trùng với một buổi học khác của bạn: Khóa học "${booking.course?.title}" từ ${bookingStart.toLocaleTimeString('vi-VN')} đến ${bookingEnd.toLocaleTimeString('vi-VN')}.`,
        };
      }
    }

    // 2. Check Mentor conflicts (all active bookings of this Mentor's courses)
    const mentorCourses = await this.courseRepository.findMany({
      where: { mentorId },
      select: ['id'],
    });
    const mentorCourseIds = mentorCourses.map((c) => c.id);

    if (mentorCourseIds.length > 0) {
      const [mentorBookings] =
        await this.courseBookingRepository.findByCourseIds(mentorCourseIds, {
          where: { status: Not(BookingStatus.CANCELLED) },
          relations: ['course'],
        });

      for (const booking of mentorBookings) {
        const bookingStart = new Date(booking.meetingTime);
        const bookingDuration = booking.course?.durationMinutes || 60;
        const bookingEnd = new Date(
          bookingStart.getTime() + bookingDuration * 60 * 1000,
        );

        if (proposedStart < bookingEnd && bookingStart < proposedEnd) {
          return {
            hasConflict: true,
            conflictType: 'mentor',
            message: `Lịch học bị trùng với lịch giảng dạy khác của Cố vấn (Mentor) vào khung giờ này.`,
          };
        }
      }
    }

    return {
      hasConflict: false,
    };
  }

  // menteeId lấy từ JWT, không để client tự truyền
  async create(payload: CreateCourseBookingInput, menteeId: string) {
    const parsed = createCourseBookingSchema.parse(payload);

    // Validate meeting time against course metadata
    const course = await this.courseRepository.findById(parsed.courseId);
    if (!course) throw new NotFoundException('Course not found');

    this.validateMeetingTime(parsed.meetingTime, course.metadata);

    // Kiểm tra trùng lịch
    const conflictCheck = await this.checkConflict(
      parsed.meetingTime,
      parsed.courseId,
      menteeId,
    );
    if (conflictCheck.hasConflict) {
      throw new BadRequestException(conflictCheck.message);
    }

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

    // Tạo booking với trạng thái PENDING chờ thanh toán, hoặc CONFIRMED nếu là khóa học miễn phí
    const created = await this.courseBookingRepository.createAndSave({
      ...parsed,
      menteeId,
      status:
        Number(course.price) === 0
          ? BookingStatus.CONFIRMED
          : BookingStatus.PENDING,
    });

    void this.sendBookingNotificationEmails(created.id).catch(() => undefined);

    return courseBookingSchema.parse(created);
  }

  async sendBookingNotificationEmails(bookingId: string) {
    const booking = await this.courseBookingRepository.findById(bookingId, {
      relations: ['course', 'course.mentor', 'mentee'],
    });

    if (!booking || !booking.course) {
      return;
    }

    const meetingTimeLabel = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(booking.meetingTime));

    const status =
      booking.status === BookingStatus.CONFIRMED ? 'confirmed' : 'pending';

    // 1. Send email to Mentee
    if (booking.mentee?.email) {
      await this.mailService
        .sendCourseBookingEmail({
          to: booking.mentee.email,
          recipientName: booking.mentee.name || 'bạn',
          courseTitle: booking.course.title,
          mentorName: booking.course.mentor?.name,
          meetingTimeLabel,
          status,
        })
        .catch((err) => {
          this.logger.error(
            `Failed to send booking email to mentee ${booking.mentee.email}: ${err?.message || err}`,
          );
        });
    }

    // 2. Send email to Mentor
    if (booking.course.mentor?.email) {
      await this.mailService
        .sendMentorBookingNotificationEmail({
          to: booking.course.mentor.email,
          recipientName: booking.course.mentor.name || 'Cố vấn',
          menteeName: booking.mentee?.name || 'Học viên',
          courseTitle: booking.course.title,
          meetingTimeLabel,
          status,
        })
        .catch((err) => {
          this.logger.error(
            `Failed to send booking email to mentor ${booking.course.mentor.email}: ${err?.message || err}`,
          );
        });
    }
  }

  private validateMeetingTime(meetingTime: Date, metadata: any) {
    if (!metadata?.time) {
      // Nếu không có config time trong metadata, coi như flexible hoàn toàn
      return;
    }

    // Format meetingTime in Vietnam timezone (+07:00)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(meetingTime);
    const dayOfWeek = (
      parts.find((p) => p.type === 'weekday')?.value || ''
    ).toLowerCase();
    const hours = parts.find((p) => p.type === 'hour')?.value || '00';
    const minutes = parts.find((p) => p.type === 'minute')?.value || '00';
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
