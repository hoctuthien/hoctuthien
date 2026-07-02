import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './services/course-review.service';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseReviewRepository } from './repositories/course-review.repository';
import { CourseBookingModule } from '../course-booking/course-booking.module';
import { CourseModule } from '../course/course.module';
import { MentorProfileModule } from '../mentor-profile/mentor-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseReviewEntity]),
    CourseBookingModule,
    CourseModule,
    MentorProfileModule,
  ],
  controllers: [CourseReviewController],
  providers: [CourseReviewService, CourseReviewRepository],
  exports: [CourseReviewService, CourseReviewRepository],
})
export class CourseReviewModule {}
