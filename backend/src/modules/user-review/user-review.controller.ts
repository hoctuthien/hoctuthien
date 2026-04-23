import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserReviewService } from './services/user-review.service';
import {
  CreateUserReviewInput,
  UpdateUserReviewInput,
} from './types/user-review.types';

@Controller('user-reviews')
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Post()
  create(@Body() payload: CreateUserReviewInput) {
    return this.userReviewService.create(payload);
  }

  @Get()
  findAll() {
    return this.userReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userReviewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserReviewInput) {
    return this.userReviewService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userReviewService.remove(id);
  }
}
