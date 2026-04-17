import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CourseReviewService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('CourseReview id is required');
    }

    return {
      id,
      message: 'CourseReview fetched successfully',
    };
  }
}
