import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CourseReviewService } from './services/course-review.service';
import {
  CreateCourseReviewInput,
  UpdateCourseReviewInput,
} from './types/course-review.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('course-reviews')
@ApiBearerAuth()
@Controller('course-reviews')
@UseGuards(JwtAuthGuard)
export class CourseReviewController {
  constructor(private readonly courseReviewService: CourseReviewService) {}

  @Post()
  create(
    @Body() payload: Omit<CreateCourseReviewInput, 'reviewerId'>,
    @User('id') reviewerId: string,
  ) {
    return this.courseReviewService.create({ ...payload, reviewerId }, reviewerId);
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
  update(
    @Param('id') id: string,
    @Body() payload: UpdateCourseReviewInput,
    @User('id') reviewerId: string,
  ) {
    return this.courseReviewService.update(id, payload, reviewerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') reviewerId: string) {
    return this.courseReviewService.remove(id, reviewerId);
  }
}
