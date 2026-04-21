import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { AuthEntity } from '../entities/auth.entity';

@Injectable()
export class AuthRepository extends BaseRepository<AuthEntity> {
  constructor(
    @InjectRepository(AuthEntity)
    repo: Repository<AuthEntity>,
  ) {
    super(repo);
  }
}
