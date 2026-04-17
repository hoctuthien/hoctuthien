import { Controller, Get, Param } from '@nestjs/common';
import { CourseReviewService } from './services/course-review.service';

@Controller('course-reviews')
export class CourseReviewController {
  constructor(private readonly course-reviewService: CourseReviewService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.course-reviewService.findOne(id);
  }
}
