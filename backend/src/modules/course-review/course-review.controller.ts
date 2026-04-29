import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseReviewService } from './services/course-review.service';
import {
  CreateCourseReviewInput,
  UpdateCourseReviewInput,
} from './types/course-review.types';

@Controller('course-reviews')
export class CourseReviewController {
  constructor(private readonly courseReviewService: CourseReviewService) {}

  @Post()
  create(@Body() payload: CreateCourseReviewInput) {
    return this.courseReviewService.create(payload);
  }

  @Get()
  findAll() {
    return this.courseReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseReviewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCourseReviewInput) {
    return this.courseReviewService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseReviewService.remove(id);
  }
}
