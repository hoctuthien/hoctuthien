import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CourseReviewRepository } from '../repositories/course-review.repository';
import { CourseBookingRepository } from '../../course-booking/repositories/course-booking.repository';
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
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly courseBookingRepository: CourseBookingRepository,
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
    return courseReviewSchema.parse(created);
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
