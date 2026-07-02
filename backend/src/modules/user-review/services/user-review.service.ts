import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserReviewRepository } from '../repositories/user-review.repository';
import { CourseBookingRepository } from '../../course-booking/repositories/course-booking.repository';
import { MentorProfileRepository } from '../../mentor-profile/repositories/mentor-profile.repository';
import { BookingStatus } from '../../course-booking/entities/course-booking.entity';
import {
  createUserReviewSchema,
  updateUserReviewSchema,
  userReviewSchema,
} from '../schema/user-review.schema';
import {
  CreateUserReviewInput,
  UpdateUserReviewInput,
} from '../types/user-review.types';

@Injectable()
export class UserReviewService {
  constructor(
    private readonly userReviewRepository: UserReviewRepository,
    private readonly courseBookingRepository: CourseBookingRepository,
    private readonly mentorProfileRepository: MentorProfileRepository,
  ) {}

  async findAll() {
    const items = await this.userReviewRepository.findMany();
    return items.map((item) => userReviewSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.userReviewRepository.findById(id);
    if (!item) throw new NotFoundException('User review not found');
    return userReviewSchema.parse(item);
  }

  async create(payload: CreateUserReviewInput, reviewerId: string) {
    const booking = await this.courseBookingRepository.findById(payload.courseBookingId, {
      relations: ['course'],
    });

    if (!booking) {
      throw new NotFoundException('Buổi đặt lịch học không tồn tại.');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Buổi học chưa hoàn thành, không thể đánh giá.');
    }

    const isMentee = booking.menteeId === reviewerId;
    const isMentor = booking.course?.mentorId === reviewerId;

    if (!isMentee && !isMentor) {
      throw new ForbiddenException('Bạn không có quyền đánh giá cho buổi học này.');
    }

    const expectedReviewedId = isMentee ? booking.course.mentorId : booking.menteeId;
    if (payload.reviewedId !== expectedReviewedId) {
      throw new BadRequestException('Người được đánh giá không hợp lệ.');
    }

    const existingReview = await this.userReviewRepository.findOne({
      courseBookingId: payload.courseBookingId,
      reviewerId,
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã thực hiện đánh giá đối phương cho buổi học này rồi.');
    }

    const parsed = createUserReviewSchema.parse(payload);
    parsed.type = isMentee ? 'mentor' : 'mentee';

    const created = await this.userReviewRepository.createAndSave(parsed);

    // Nếu người được đánh giá là Mentor, tính toán lại điểm đánh giá trung bình
    if (isMentee) {
      const mentorProfile = await this.mentorProfileRepository.findOne({ userId: expectedReviewedId });
      if (mentorProfile) {
        const reviews = await this.userReviewRepository.findMany({
          where: { reviewedId: expectedReviewedId, type: 'mentor' },
        });
        
        // Vì review vừa tạo cũng nằm trong database (do đã save), ta tính tổng tất cả
        const ratings = reviews.map((r) => r.rating);
        const sum = ratings.reduce((a, b) => a + b, 0);
        const average = ratings.length > 0 ? sum / ratings.length : 0;

        await this.mentorProfileRepository.updateById(mentorProfile.id, {
          averageRating: parseFloat(average.toFixed(2)),
        });
      }
    }

    return userReviewSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserReviewInput, reviewerId: string) {
    const review = await this.userReviewRepository.findById(id);
    if (!review) throw new NotFoundException('User review not found');

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đánh giá này.');
    }

    const parsed = updateUserReviewSchema.parse(payload);
    const updated = await this.userReviewRepository.updateById(id, parsed);

    // Nếu người được đánh giá là Mentor, tính toán lại điểm trung bình khi rating thay đổi
    if (review.type === 'mentor') {
      const mentorProfile = await this.mentorProfileRepository.findOne({ userId: review.reviewedId });
      if (mentorProfile) {
        const reviews = await this.userReviewRepository.findMany({
          where: { reviewedId: review.reviewedId, type: 'mentor' },
        });
        const ratings = reviews.map((r) => r.rating);
        const sum = ratings.reduce((a, b) => a + b, 0);
        const average = ratings.length > 0 ? sum / ratings.length : 0;

        await this.mentorProfileRepository.updateById(mentorProfile.id, {
          averageRating: parseFloat(average.toFixed(2)),
        });
      }
    }

    return userReviewSchema.parse(updated);
  }

  async remove(id: string, reviewerId: string) {
    const review = await this.userReviewRepository.findById(id);
    if (!review) throw new NotFoundException('User review not found');

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này.');
    }

    await this.userReviewRepository.softDeleteById(id);

    // Tính toán lại điểm trung bình sau khi xóa
    if (review.type === 'mentor') {
      const mentorProfile = await this.mentorProfileRepository.findOne({ userId: review.reviewedId });
      if (mentorProfile) {
        const reviews = await this.userReviewRepository.findMany({
          where: { reviewedId: review.reviewedId, type: 'mentor' },
        });
        const ratings = reviews.map((r) => r.rating);
        const sum = ratings.reduce((a, b) => a + b, 0);
        const average = ratings.length > 0 ? sum / ratings.length : 0;

        await this.mentorProfileRepository.updateById(mentorProfile.id, {
          averageRating: parseFloat(average.toFixed(2)),
        });
      }
    }
  }
}
