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
}
