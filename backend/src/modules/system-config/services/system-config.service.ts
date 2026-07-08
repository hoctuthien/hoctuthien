import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemConfigRepository } from '../repositories/system-config.repository';
import {
  createSystemConfigSchema,
  updateSystemConfigSchema,
  systemConfigSchema,
} from '../schema/system-config.schema';
import {
  CreateSystemConfigInput,
  UpdateSystemConfigInput,
} from '../types/system-config.types';
import {
  defaultMenteePolicyConfig,
  MENTEE_POLICY_CONFIG_KEY,
} from '../default-policy.config';

@Injectable()
export class SystemConfigService {
  constructor(
    private readonly systemConfigRepository: SystemConfigRepository,
  ) {}

  async findAll() {
    const items = await this.systemConfigRepository.findMany();
    return items.map((item) => systemConfigSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.systemConfigRepository.findById(id);
    if (!item) throw new NotFoundException('System configuration not found');
    return systemConfigSchema.parse(item);
  }

  async findByKey(key: string) {
    const item = await this.systemConfigRepository.findOne({ configKey: key });
    return item ? systemConfigSchema.parse(item) : null;
  }

  async findPublicByKey(key: string) {
    const item = await this.systemConfigRepository.findOne({
      configKey: key,
      status: 'active',
    });

    if (item) {
      return systemConfigSchema.parse(item);
    }

    if (key === MENTEE_POLICY_CONFIG_KEY) {
      return {
        id: MENTEE_POLICY_CONFIG_KEY,
        configKey: MENTEE_POLICY_CONFIG_KEY,
        configValue: defaultMenteePolicyConfig,
        description: 'Default mentee policy',
        createdBy: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    }

    throw new NotFoundException('System configuration not found');
  }

  async create(payload: CreateSystemConfigInput) {
    const parsed = createSystemConfigSchema.parse(payload);
    const created = await this.systemConfigRepository.createAndSave(parsed);
    return systemConfigSchema.parse(created);
  }

  async update(id: string, payload: UpdateSystemConfigInput) {
    const parsed = updateSystemConfigSchema.parse(payload);
    const updated = await this.systemConfigRepository.updateById(id, parsed);
    return systemConfigSchema.parse(updated);
  }

  async remove(id: string) {
    await this.systemConfigRepository.softDeleteById(id);
  }
}
