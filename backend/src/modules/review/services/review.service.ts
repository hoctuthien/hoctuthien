import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ReviewService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Review id is required');
    }

    return {
      id,
      message: 'Review fetched successfully',
    };
  }
}
