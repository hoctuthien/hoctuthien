import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ConversationEntity } from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository extends BaseRepository<ConversationEntity> {
  constructor(
    @InjectRepository(ConversationEntity)
    repo: Repository<ConversationEntity>,
  ) {
    super(repo);
  }
}
