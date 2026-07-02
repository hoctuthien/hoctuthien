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

  async getAverageRatingForCourse(courseId: string): Promise<{ avg: number; count: number }> {
    const result = await this.repo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.courseId = :courseId', { courseId })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne();

    return {
      avg: parseFloat(result?.avg ?? '0') || 0,
      count: parseInt(result?.count ?? '0', 10) || 0,
    };
  }
}
