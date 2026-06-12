import { Injectable, NotFoundException } from '@nestjs/common';
import { MentorProfileRepository } from '../repositories/mentor-profile.repository';
import {
  createMentorProfileSchema,
  updateMentorProfileSchema,
  mentorProfileSchema,
} from '../schema/mentor-profile.schema';
import {
  CreateMentorProfileDto,
  UpdateMentorProfileDto,
} from '../dtos/mentor-profile.dto';

@Injectable()
export class MentorProfileService {
  constructor(
    private readonly mentorProfileRepository: MentorProfileRepository,
  ) {}

  async findAll(query?: { page?: number; limit?: number; search?: string; skills?: string; minExperience?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    const [items, total] = await this.mentorProfileRepository.findActiveMentorsWithFilters({
      page,
      limit,
      search: query?.search,
      skills: query?.skills,
      minExperience: query?.minExperience,
    });

    const { createPaginationMeta } = await import('../../../common/utils/pagination.util');

    return {
      items: items.map((item) => mentorProfileSchema.parse(item)),
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const item = await this.mentorProfileRepository.findById(id);
    if (!item) throw new NotFoundException('Mentor profile not found');
    return mentorProfileSchema.parse(item);
  }

  async findByUserId(userId: string) {
    const item = await this.mentorProfileRepository.findOne({ userId }, { relations: ['user'] });
    if (!item)
      throw new NotFoundException('Mentor profile not found for this user');
    return mentorProfileSchema.parse(item);
  }

  async create(payload: CreateMentorProfileDto) {
    const parsed = createMentorProfileSchema.parse(payload);
    const created = await this.mentorProfileRepository.createAndSave(parsed);
    return mentorProfileSchema.parse(created);
  }

  async update(id: string, payload: UpdateMentorProfileDto) {
    const parsed = updateMentorProfileSchema.parse(payload);
    const updated = await this.mentorProfileRepository.updateById(id, parsed);
    return mentorProfileSchema.parse(updated);
  }

  async remove(id: string) {
    await this.mentorProfileRepository.softDeleteById(id);
  }
}
