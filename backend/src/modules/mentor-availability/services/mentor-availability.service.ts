import { Injectable, NotFoundException } from '@nestjs/common';
import { MentorAvailabilityRepository } from '../repositories/mentor-availability.repository';
import {
  createMentorAvailabilitySchema,
  updateMentorAvailabilitySchema,
  mentorAvailabilitySchema,
} from '../schema/mentor-availability.schema';
import {
  CreateMentorAvailabilityInput,
  UpdateMentorAvailabilityInput,
} from '../types/mentor-availability.types';

@Injectable()
export class MentorAvailabilityService {
  constructor(private readonly mentorAvailabilityRepository: MentorAvailabilityRepository) {}

  async findAll() {
    const items = await this.mentorAvailabilityRepository.findMany();
    return items.map(item => mentorAvailabilitySchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.mentorAvailabilityRepository.findById(id);
    if (!item) throw new NotFoundException('Mentor availability not found');
    return mentorAvailabilitySchema.parse(item);
  }

  async create(payload: CreateMentorAvailabilityInput) {
    const parsed = createMentorAvailabilitySchema.parse(payload);
    const created = await this.mentorAvailabilityRepository.createAndSave(parsed);
    return mentorAvailabilitySchema.parse(created);
  }

  async update(id: string, payload: UpdateMentorAvailabilityInput) {
    const parsed = updateMentorAvailabilitySchema.parse(payload);
    const updated = await this.mentorAvailabilityRepository.updateById(id, parsed);
    return mentorAvailabilitySchema.parse(updated);
  }

  async remove(id: string) {
    await this.mentorAvailabilityRepository.softDeleteById(id);
  }
}
