import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SystemConfigEntity } from '../entities/system-config.entity';

@Injectable()
export class SystemConfigRepository extends BaseRepository<SystemConfigEntity> {
  constructor(
    @InjectRepository(SystemConfigEntity)
    repo: Repository<SystemConfigEntity>,
  ) {
    super(repo);
  }
}
