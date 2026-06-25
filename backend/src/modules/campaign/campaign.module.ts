import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignEntity } from './entities/campaign.entity';
import { CampaignRepository } from './repositories/campaign.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignEntity])],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignService],
})
export class CampaignModule {}
