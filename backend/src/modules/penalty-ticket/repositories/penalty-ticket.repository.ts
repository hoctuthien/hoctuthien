import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PenaltyTicketEntity } from '../entities/penalty-ticket.entity';

@Injectable()
export class PenaltyTicketRepository extends BaseRepository<PenaltyTicketEntity> {
  constructor(
    @InjectRepository(PenaltyTicketEntity)
    repo: Repository<PenaltyTicketEntity>,
  ) {
    super(repo);
  }
}
