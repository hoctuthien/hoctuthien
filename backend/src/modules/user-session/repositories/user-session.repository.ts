import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { UserSessionEntity } from '../entities/user-session.entity';

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSessionEntity> {
  constructor(
    @InjectRepository(UserSessionEntity)
    repo: Repository<UserSessionEntity>,
  ) {
    super(repo);
  }
}
