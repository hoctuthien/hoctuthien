import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CourseEntity } from '../entities/course.entity';

@Injectable()
export class CourseRepository extends BaseRepository<CourseEntity> {
  constructor(
    @InjectRepository(CourseEntity)
    repo: Repository<CourseEntity>,
  ) {
    super(repo);
  }
}
