import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseBookingService } from './services/course-booking.service';
import {
  CreateCourseBookingInput,
  UpdateCourseBookingInput,
} from './types/course-booking.types';

@Controller('course-bookings')
export class CourseBookingController {
  constructor(private readonly courseBookingService: CourseBookingService) {}

  @Post()
  create(@Body() payload: CreateCourseBookingInput) {
    return this.courseBookingService.create(payload);
  }

  @Get()
  findAll() {
    return this.courseBookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseBookingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCourseBookingInput) {
    return this.courseBookingService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseBookingService.remove(id);
  }
}
