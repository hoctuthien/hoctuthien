import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './services/course-review.service';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseReviewRepository } from './repositories/course-review.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity])],
  controllers: [CourseReviewController],
  providers: [CourseReviewService, CourseReviewRepository],
  exports: [CourseReviewService, CourseReviewRepository],
})
export class CourseReviewModule {}
