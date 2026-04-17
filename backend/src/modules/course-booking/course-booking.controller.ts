import { Controller, Get, Param } from '@nestjs/common';
import { CourseBookingService } from './services/course-booking.service';

@Controller('course-bookings')
export class CourseBookingController {
  constructor(private readonly courseBookingService: CourseBookingService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseBookingService.findOne(id);
  }
}
