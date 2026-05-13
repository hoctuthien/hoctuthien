import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    repo: Repository<CategoryEntity>,
  ) {
    super(repo);
  }

  async findManyWithCount(
    options?: FindManyOptions<CategoryEntity>,
  ): Promise<[CategoryEntity[], number]> {
    return this.repo.findAndCount(options);
  }
}
