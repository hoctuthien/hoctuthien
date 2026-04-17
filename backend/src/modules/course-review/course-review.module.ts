import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './services/course-review.service';
import { CourseReviewEntity } from './entities/course-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity])],
  controllers: [CourseReviewController],
  providers: [CourseReviewService],
  exports: [CourseReviewService],
})
export class CourseReviewModule {}
