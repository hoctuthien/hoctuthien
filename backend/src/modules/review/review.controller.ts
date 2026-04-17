import { Controller, Get, Param } from '@nestjs/common';
import { ReviewService } from './services/review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }
}
