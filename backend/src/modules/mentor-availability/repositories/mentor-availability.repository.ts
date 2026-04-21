import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { MentorAvailabilityEntity } from '../entities/mentor-availability.entity';

@Injectable()
export class MentorAvailabilityRepository extends BaseRepository<MentorAvailabilityEntity> {
  constructor(
    @InjectRepository(MentorAvailabilityEntity)
    repo: Repository<MentorAvailabilityEntity>,
  ) {
    super(repo);
  }
}
