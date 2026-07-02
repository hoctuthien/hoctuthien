import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { BugReportEntity } from '../entities/bug-report.entity';

@Injectable()
export class BugReportRepository extends BaseRepository<BugReportEntity> {
  constructor(
    @InjectRepository(BugReportEntity)
    repo: Repository<BugReportEntity>,
  ) {
    super(repo);
  }

  async findManyWithCount(
    options?: FindManyOptions<BugReportEntity>,
  ): Promise<[BugReportEntity[], number]> {
    return this.repo.findAndCount(options);
  }
}
