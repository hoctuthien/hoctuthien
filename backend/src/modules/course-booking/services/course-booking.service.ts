import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CourseBookingService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('CourseBooking id is required');
    }

    return {
      id,
      message: 'CourseBooking fetched successfully',
    };
  }
}
