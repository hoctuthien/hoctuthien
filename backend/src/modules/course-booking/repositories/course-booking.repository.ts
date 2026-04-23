import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CourseBookingEntity } from '../entities/course-booking.entity';

@Injectable()
export class CourseBookingRepository extends BaseRepository<CourseBookingEntity> {
  constructor(
    @InjectRepository(CourseBookingEntity)
    repo: Repository<CourseBookingEntity>,
  ) {
    super(repo);
  }
}
