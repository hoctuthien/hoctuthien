import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeController } from './badge.controller';
import { BadgeService } from './services/badge.service';
import { BadgeListener } from './listeners/badge.listener';
import { BadgeEntity } from './entities/badge.entity';
import { UserBadgeEntity } from './entities/user-badge.entity';
import { CourseBookingEntity } from '../course-booking/entities/course-booking.entity';
import { CourseReviewEntity } from '../course-review/entities/course-review.entity';
import { MentorProfileEntity } from '../mentor-profile/entities/mentor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BadgeEntity,
      UserBadgeEntity,
      CourseBookingEntity,
      CourseReviewEntity,
      MentorProfileEntity,
    ]),
  ],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeListener],
  exports: [BadgeService],
})
export class BadgeModule {}
