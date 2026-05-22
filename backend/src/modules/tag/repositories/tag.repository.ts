import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { TagEntity } from '../entities/tag.entity';

@Injectable()
export class TagRepository extends BaseRepository<TagEntity> {
  constructor(
    @InjectRepository(TagEntity)
    repo: Repository<TagEntity>,
  ) {
    super(repo);
  }
}
