import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewService } from './services/course-review.service';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseReviewController } from './course-review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity])],
  controllers: [CourseReviewController],
  providers: [CourseReviewService],
  exports: [CourseReviewService],
})
export class CourseReviewModule {}
