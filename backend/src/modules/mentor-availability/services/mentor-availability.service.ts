import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { ErrorCode, ErrorMessage } from '../../../common/enums/error-code.enum';
import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';
import { APPLICATION_MESSAGES } from '../../../common/constants/message.constant';
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

  async create(mentorId: string, payload: CreateMentorAvailabilityInput) {
    const existing = await this.mentorAvailabilityRepository.findOne({
      mentorId,
      status: In([MentorAvailabilityStatus.PENDING, MentorAvailabilityStatus.IN_PROGRESS]),
    });

    if (existing) {
      throw new BadRequestException({
        code: ErrorCode.APPLICATION_ALREADY_EXISTS,
        message: ErrorMessage[ErrorCode.APPLICATION_ALREADY_EXISTS],
      });
    }

    try {
      const parsed = createMentorAvailabilitySchema.parse(payload);
      const created = await this.mentorAvailabilityRepository.createAndSave({
        ...parsed,
        mentorId,
        status: MentorAvailabilityStatus.PENDING,
      });
      return {
        message: APPLICATION_MESSAGES.SUCCESS,
        data: mentorAvailabilitySchema.parse(created),
      };
    } catch (error) {
      throw new BadRequestException({
         code: ErrorCode.APPLICATION_FAILED,
         message: ErrorMessage[ErrorCode.APPLICATION_FAILED],
         error: error.message,
      });
    }
  }

  async update(id: string, payload: UpdateMentorAvailabilityInput) {
    const parsed = updateMentorAvailabilitySchema.parse(payload);
    const updated = await this.mentorAvailabilityRepository.updateById(id, parsed);
    return mentorAvailabilitySchema.parse(updated);
  }

  async updateToInProgress(id: string, adminId: string) {
    const current = await this.mentorAvailabilityRepository.findById(id);

    if (!current) {
      throw new NotFoundException('Mentor availability not found');
    }

    if (current.status !== MentorAvailabilityStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be moved to in progress');
    }

    const updated = await this.mentorAvailabilityRepository.updateById(id, {
      status: MentorAvailabilityStatus.IN_PROGRESS,
      approvedBy: adminId,
    });

    return mentorAvailabilitySchema.parse(updated);
  }

  async approve(id: string, adminId: string) {
    const current = await this.mentorAvailabilityRepository.findById(id);

    if (!current) {
      throw new NotFoundException('Mentor availability not found');
    }

    if (current.status !== MentorAvailabilityStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in progress requests can be approved');
    }

    if (current.approvedBy && current.approvedBy !== adminId) {
      throw new BadRequestException('approved_by does not match the admin who started processing this request');
    }

    const updated = await this.mentorAvailabilityRepository.updateById(id, {
      status: MentorAvailabilityStatus.APPROVED,
    });

    return mentorAvailabilitySchema.parse(updated);
  }

  async reject(id: string, adminId: string) {
    const current = await this.mentorAvailabilityRepository.findById(id);

    if (!current) {
      throw new NotFoundException('Mentor availability not found');
    }

    if (current.status !== MentorAvailabilityStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in progress requests can be rejected');
    }

    if (current.approvedBy && current.approvedBy !== adminId) {
      throw new BadRequestException('approved_by does not match the admin who started processing this request');
    }

    const updated = await this.mentorAvailabilityRepository.updateById(id, {
      status: MentorAvailabilityStatus.REJECTED,
    });

    return mentorAvailabilitySchema.parse(updated);
  }

  async remove(id: string) {
    await this.mentorAvailabilityRepository.softDeleteById(id);
  }
}
