import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
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

  async findManyWithCount(
    options?: FindManyOptions<CourseBookingEntity>,
  ): Promise<[CourseBookingEntity[], number]> {
    return this.repo.findAndCount(options);
  }

  async findByCourseIds(
    courseIds: string[],
    options?: FindManyOptions<CourseBookingEntity>,
  ): Promise<[CourseBookingEntity[], number]> {
    return this.repo.findAndCount({
      ...options,
      where: { courseId: In(courseIds), ...(options?.where as object) },
    });
  }
}
