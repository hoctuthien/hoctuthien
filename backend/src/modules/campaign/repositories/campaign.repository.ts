import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CampaignEntity } from '../entities/campaign.entity';

@Injectable()
export class CampaignRepository extends BaseRepository<CampaignEntity> {
  constructor(
    @InjectRepository(CampaignEntity)
    repo: Repository<CampaignEntity>,
  ) {
    super(repo);
  }
}
