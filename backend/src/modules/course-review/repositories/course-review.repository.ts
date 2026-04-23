import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CourseReviewEntity } from '../entities/course-review.entity';

@Injectable()
export class CourseReviewRepository extends BaseRepository<CourseReviewEntity> {
  constructor(
    @InjectRepository(CourseReviewEntity)
    repo: Repository<CourseReviewEntity>,
  ) {
    super(repo);
  }
}
