import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignRepository } from '../repositories/campaign.repository';
import {
  campaignSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from '../schema/campaign.schema';
import { CampaignStatus } from '../entities/campaign.entity';

@Injectable()
export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async findAll(status?: CampaignStatus, page = 1, limit = 20) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.campaignRepository.findManyWithCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: items.map((c) => campaignSchema.parse(c)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const item = await this.campaignRepository.findById(id);
    if (!item) throw new NotFoundException('Campaign not found');
    return campaignSchema.parse(item);
  }

  async create(payload: any, createdBy: string) {
    const parsed = createCampaignSchema.parse(payload);
    const created = await this.campaignRepository.createAndSave({
      ...parsed,
      createdBy,
    });
    return campaignSchema.parse(created);
  }

  async update(id: string, payload: any) {
    const item = await this.campaignRepository.findById(id);
    if (!item) throw new NotFoundException('Campaign not found');
    const parsed = updateCampaignSchema.parse(payload);
    const updated = await this.campaignRepository.updateById(id, parsed);
    return campaignSchema.parse(updated);
  }

  async remove(id: string) {
    await this.campaignRepository.softDeleteById(id);
  }
}
