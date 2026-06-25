import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { CourseReviewRepository } from '../repositories/course-review.repository';
import { CourseBookingRepository } from '../../course-booking/repositories/course-booking.repository';
import { CourseRepository } from '../../course/repositories/course.repository';
import { MentorProfileRepository } from '../../mentor-profile/repositories/mentor-profile.repository';
import { BookingStatus } from '../../course-booking/entities/course-booking.entity';
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
  private readonly logger = new Logger(CourseReviewService.name);

  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly courseBookingRepository: CourseBookingRepository,
    private readonly courseRepository: CourseRepository,
    private readonly mentorProfileRepository: MentorProfileRepository,
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

  async create(payload: CreateCourseReviewInput, reviewerId: string) {
    const booking = await this.courseBookingRepository.findById(payload.courseBookingId, {
      relations: ['course'],
    });

    if (!booking) {
      throw new NotFoundException('Buổi đặt lịch học không tồn tại.');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Buổi học chưa hoàn thành, không thể đánh giá.');
    }

    if (booking.menteeId !== reviewerId) {
      throw new ForbiddenException('Bạn không có quyền đánh giá buổi học này.');
    }

    if (booking.courseId !== payload.courseId) {
      throw new BadRequestException('Khóa học được đánh giá không khớp với buổi đặt lịch.');
    }

    const existingReview = await this.courseReviewRepository.findOne({
      courseBookingId: payload.courseBookingId,
    });

    if (existingReview) {
      throw new BadRequestException('Buổi học này đã được đánh giá khóa học rồi.');
    }

    const parsed = createCourseReviewSchema.parse(payload);
    const created = await this.courseReviewRepository.createAndSave(parsed);

    void this.updateMentorRatingStats(booking.courseId).catch((err) => {
      this.logger.error(`Failed to update mentor rating stats: ${err?.message}`);
    });

    return courseReviewSchema.parse(created);
  }

  private async updateMentorRatingStats(courseId: string) {
    const course = await this.courseRepository.findById(courseId);
    if (!course?.mentorId) return;

    const mentorProfile = await this.mentorProfileRepository.findOne({ userId: course.mentorId });
    if (!mentorProfile) return;

    const { avg, count } = await this.courseReviewRepository.getAverageRatingForCourse(courseId);
    const roundedAvg = Math.round(avg * 100) / 100;

    await this.mentorProfileRepository.updateById(mentorProfile.id, {
      averageRating: roundedAvg,
      totalStudents: count,
    } as any);
  }

  async update(id: string, payload: UpdateCourseReviewInput, reviewerId: string) {
    const review = await this.courseReviewRepository.findById(id);
    if (!review) throw new NotFoundException('Course Review not found');

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đánh giá này.');
    }

    const parsed = updateCourseReviewSchema.parse(payload);
    const updated = await this.courseReviewRepository.updateById(id, parsed);
    return courseReviewSchema.parse(updated);
  }

  async remove(id: string, reviewerId: string) {
    const review = await this.courseReviewRepository.findById(id);
    if (!review) throw new NotFoundException('Course Review not found');

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này.');
    }

    await this.courseReviewRepository.softDeleteById(id);
  }
}
