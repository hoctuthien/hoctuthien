import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CourseCategoryEntity } from '../entities/course-category.entity';

@Injectable()
export class CourseCategoryRepository extends BaseRepository<CourseCategoryEntity> {
  constructor(
    @InjectRepository(CourseCategoryEntity)
    repo: Repository<CourseCategoryEntity>,
  ) {
    super(repo);
  }
}
