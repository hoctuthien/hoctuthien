import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity, BadgeCondition } from '../entities/badge.entity';
import { UserBadgeEntity } from '../entities/user-badge.entity';
import { BookingStatus } from '../../course-booking/entities/course-booking.entity';
import { CourseBookingEntity } from '../../course-booking/entities/course-booking.entity';
import { CourseReviewEntity } from '../../course-review/entities/course-review.entity';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly badgeRepo: Repository<BadgeEntity>,

    @InjectRepository(UserBadgeEntity)
    private readonly userBadgeRepo: Repository<UserBadgeEntity>,

    @InjectRepository(CourseBookingEntity)
    private readonly bookingRepo: Repository<CourseBookingEntity>,

    @InjectRepository(CourseReviewEntity)
    private readonly reviewRepo: Repository<CourseReviewEntity>,

    @InjectRepository(MentorProfileEntity)
    private readonly mentorProfileRepo: Repository<MentorProfileEntity>,
  ) {}

  async getUserBadges(userId: string) {
    return this.userBadgeRepo.find({
      where: { userId },
      relations: ['badge'],
      order: { awardedAt: 'DESC' },
    });
  }

  async checkAndAwardBadges(userId: string, userRole: string) {
    const allBadges = await this.badgeRepo.find();
    const existingBadgeIds = (
      await this.userBadgeRepo.find({ where: { userId }, select: ['badgeId'] })
    ).map((ub) => ub.badgeId);

    const toAward: BadgeEntity[] = [];

    for (const badge of allBadges) {
      if (existingBadgeIds.includes(badge.id)) continue;

      const shouldAward = await this.evaluateCondition(badge.condition, userId, userRole);
      if (shouldAward) toAward.push(badge);
    }

    for (const badge of toAward) {
      await this.userBadgeRepo.save(
        this.userBadgeRepo.create({ userId, badgeId: badge.id, awardedAt: new Date() }),
      );
    }

    return toAward;
  }

  private async evaluateCondition(condition: BadgeCondition, userId: string, userRole: string): Promise<boolean> {
    switch (condition) {
      case BadgeCondition.FIRST_BOOKING: {
        const count = await this.bookingRepo.count({ where: { menteeId: userId } });
        return count >= 1;
      }
      case BadgeCondition.COMPLETE_5_SESSIONS: {
        const count = await this.bookingRepo.count({
          where: { menteeId: userId, status: BookingStatus.COMPLETED },
        });
        return count >= 5;
      }
      case BadgeCondition.COMPLETE_10_SESSIONS: {
        const count = await this.bookingRepo.count({
          where: { menteeId: userId, status: BookingStatus.COMPLETED },
        });
        return count >= 10;
      }
      case BadgeCondition.FIRST_REVIEW: {
        const count = await this.reviewRepo.count({ where: { reviewerId: userId } });
        return count >= 1;
      }
      case BadgeCondition.TOP_MENTOR_10_STUDENTS: {
        const profile = await this.mentorProfileRepo.findOne({ where: { userId } });
        return profile ? profile.totalStudents >= 10 : false;
      }
      case BadgeCondition.TOP_MENTOR_50_STUDENTS: {
        const profile = await this.mentorProfileRepo.findOne({ where: { userId } });
        return profile ? profile.totalStudents >= 50 : false;
      }
      default:
        return false;
    }
  }

  async seedDefaultBadges() {
    const defaults = [
      { name: 'Buổi học đầu tiên', description: 'Đặt lịch học đầu tiên', iconUrl: null, condition: BadgeCondition.FIRST_BOOKING },
      { name: '5 buổi học', description: 'Hoàn thành 5 buổi học', iconUrl: null, condition: BadgeCondition.COMPLETE_5_SESSIONS },
      { name: '10 buổi học', description: 'Hoàn thành 10 buổi học', iconUrl: null, condition: BadgeCondition.COMPLETE_10_SESSIONS },
      { name: 'Đánh giá đầu tiên', description: 'Gửi đánh giá khóa học đầu tiên', iconUrl: null, condition: BadgeCondition.FIRST_REVIEW },
      { name: 'Cố vấn tích cực', description: 'Có 10 học viên', iconUrl: null, condition: BadgeCondition.TOP_MENTOR_10_STUDENTS },
      { name: 'Cố vấn nổi bật', description: 'Có 50 học viên', iconUrl: null, condition: BadgeCondition.TOP_MENTOR_50_STUDENTS },
    ];

    for (const d of defaults) {
      const exists = await this.badgeRepo.findOne({ where: { condition: d.condition } });
      if (!exists) {
        await this.badgeRepo.save(this.badgeRepo.create(d));
      }
    }
  }
}
