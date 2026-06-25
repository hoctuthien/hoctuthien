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
import { UserReviewService } from './services/user-review.service';
import {
  CreateUserReviewInput,
  UpdateUserReviewInput,
} from './types/user-review.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('user-reviews')
@ApiBearerAuth()
@Controller('user-reviews')
@UseGuards(JwtAuthGuard)
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Post()
  create(
    @Body() payload: Omit<CreateUserReviewInput, 'reviewerId'>,
    @User('id') reviewerId: string,
  ) {
    return this.userReviewService.create({ ...payload, reviewerId }, reviewerId);
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
  update(
    @Param('id') id: string,
    @Body() payload: UpdateUserReviewInput,
    @User('id') reviewerId: string,
  ) {
    return this.userReviewService.update(id, payload, reviewerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') reviewerId: string) {
    return this.userReviewService.remove(id, reviewerId);
  }
}
