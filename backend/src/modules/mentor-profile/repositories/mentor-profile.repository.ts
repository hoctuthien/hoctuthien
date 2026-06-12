import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { MentorProfileEntity } from '../entities/mentor-profile.entity';

@Injectable()
export class MentorProfileRepository extends BaseRepository<MentorProfileEntity> {
  constructor(
    @InjectRepository(MentorProfileEntity)
    repo: Repository<MentorProfileEntity>,
  ) {
    super(repo);
  }

  async findActiveMentorsWithFilters(query: {
    page: number;
    limit: number;
    search?: string;
    skills?: string;
    minExperience?: number;
  }): Promise<[MentorProfileEntity[], number]> {
    const skip = (query.page - 1) * query.limit;

    const qb = this.createQueryBuilder('mp');
    qb.leftJoinAndSelect('mp.user', 'user');

    // Mặc định chỉ lấy các mentor đã được duyệt và đang hoạt động
    qb.andWhere('mp.isApproved = :isApproved', { isApproved: true });
    qb.andWhere('mp.status = :status', { status: 'ACTIVE' });

    if (query.search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR mp.jobTitle ILIKE :search OR mp.company ILIKE :search OR mp.bio ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.skills) {
      // Vì skills là kiểu JSONB array, ta có thể so sánh dạng text
      qb.andWhere('mp.skills::text ILIKE :skills', { skills: `%${query.skills}%` });
    }

    if (query.minExperience !== undefined) {
      qb.andWhere('mp.yearsOfExperience >= :minExperience', {
        minExperience: query.minExperience,
      });
    }

    qb.orderBy('mp.createdAt', 'DESC');
    qb.skip(skip);
    qb.take(query.limit);

    return qb.getManyAndCount();
  }
}
