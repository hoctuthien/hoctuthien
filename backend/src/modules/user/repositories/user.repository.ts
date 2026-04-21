import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repo: Repository<UserEntity>,
  ) {
    super(repo);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ email });
  }
}
