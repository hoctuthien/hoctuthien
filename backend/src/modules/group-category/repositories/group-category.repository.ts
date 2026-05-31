import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { GroupCategoryEntity } from '../entities/group-category.entity';

@Injectable()
export class GroupCategoryRepository extends BaseRepository<GroupCategoryEntity> {
  constructor(
    @InjectRepository(GroupCategoryEntity)
    repo: Repository<GroupCategoryEntity>,
  ) {
    super(repo);
  }

  async findManyWithCount(
    options?: FindManyOptions<GroupCategoryEntity>,
  ): Promise<[GroupCategoryEntity[], number]> {
    return this.repo.findAndCount(options);
  }
}
