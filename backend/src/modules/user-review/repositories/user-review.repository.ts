import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { UserReviewEntity } from '../entities/user-review.entity';

@Injectable()
export class UserReviewRepository extends BaseRepository<UserReviewEntity> {
  constructor(
    @InjectRepository(UserReviewEntity)
    repo: Repository<UserReviewEntity>,
  ) {
    super(repo);
  }
}
