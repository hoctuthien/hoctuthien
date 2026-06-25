import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReviewController } from './user-review.controller';
import { UserReviewService } from './services/user-review.service';
import { UserReviewEntity } from './entities/user-review.entity';
import { UserReviewRepository } from './repositories/user-review.repository';
import { CourseBookingModule } from '../course-booking/course-booking.module';
import { MentorProfileModule } from '../mentor-profile/mentor-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserReviewEntity]),
    CourseBookingModule,
    MentorProfileModule,
  ],
  controllers: [UserReviewController],
  providers: [UserReviewService, UserReviewRepository],
  exports: [UserReviewService, UserReviewRepository],
})
export class UserReviewModule {}
