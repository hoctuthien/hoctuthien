import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CourseService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Course id is required');
    }

    return {
      id,
      message: 'Course fetched successfully',
    };
  }
}
