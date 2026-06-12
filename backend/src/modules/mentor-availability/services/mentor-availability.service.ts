import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { In, DataSource } from 'typeorm';
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
import { MentorAvailabilityEntity } from '../entities/mentor-availability.entity';
import { UserEntity, UserRole } from '../../user/entities/user.entity';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';
import { MentorProfileStatus } from '../../mentor-profile/enums/mentor-profile-status.enum';
import { createPaginationMeta } from '../../../common/utils/pagination.util';

@Injectable()
export class MentorAvailabilityService {
  constructor(
    private readonly mentorAvailabilityRepository: MentorAvailabilityRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query?: { page?: number; limit?: number; search?: string; status?: MentorAvailabilityStatus }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.mentorAvailabilityRepository.createQueryBuilder('ma');
    qb.leftJoinAndSelect('ma.mentor', 'mentor');

    if (query?.status) {
      qb.andWhere('ma.status = :status', { status: query.status });
    }

    if (query?.search) {
      qb.andWhere(
        '(mentor.name ILIKE :search OR mentor.email ILIKE :search OR ma.jobTitle ILIKE :search OR ma.company ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('ma.createdAt', 'DESC');
    qb.skip(skip);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => mentorAvailabilitySchema.parse(item)),
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findByMentorId(mentorId: string) {
    const items = await this.mentorAvailabilityRepository.findMany({
      where: { mentorId } as any,
    });
    return items.map((item) => mentorAvailabilitySchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.mentorAvailabilityRepository.findById(id);
    if (!item) throw new NotFoundException('Mentor availability not found');
    return mentorAvailabilitySchema.parse(item);
  }

  async findOneForMentor(id: string, mentorId: string) {
    const item = await this.mentorAvailabilityRepository.findById(id);
    if (!item) throw new NotFoundException('Mentor availability not found');
    if (item.mentorId !== mentorId) {
      throw new NotFoundException('Mentor availability not found');
    }
    return mentorAvailabilitySchema.parse(item);
  }

  async create(mentorId: string, payload: CreateMentorAvailabilityInput) {
    const existing = await this.mentorAvailabilityRepository.findOne({
      mentorId,
      status: In([
        MentorAvailabilityStatus.PENDING,
        MentorAvailabilityStatus.IN_PROGRESS,
      ]),
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
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MentorAvailabilityEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Mentor availability not found');
      }

      const parsed = updateMentorAvailabilitySchema.parse(payload);

      if (
        parsed.status === MentorAvailabilityStatus.IN_PROGRESS &&
        current.status !== MentorAvailabilityStatus.PENDING
      ) {
        throw new BadRequestException(
          'Only pending requests can be moved to in progress',
        );
      }

      if (
        (parsed.status === MentorAvailabilityStatus.APPROVED ||
          parsed.status === MentorAvailabilityStatus.REJECTED) &&
        current.status !== MentorAvailabilityStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Only in progress requests can be approved or rejected',
        );
      }

      Object.assign(current, parsed);
      const updated = await manager.save(MentorAvailabilityEntity, current);
      return mentorAvailabilitySchema.parse(updated);
    });
  }

  async updateToInProgress(id: string, adminId: string) {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MentorAvailabilityEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Mentor availability not found');
      }

      if (current.status !== MentorAvailabilityStatus.PENDING) {
        throw new BadRequestException(
          'Only pending requests can be moved to in progress',
        );
      }

      current.status = MentorAvailabilityStatus.IN_PROGRESS;
      current.approvedBy = adminId;

      const updated = await manager.save(MentorAvailabilityEntity, current);
      return mentorAvailabilitySchema.parse(updated);
    });
  }

  async approve(id: string, adminId: string, note: string) {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MentorAvailabilityEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Mentor availability not found');
      }

      if (current.status !== MentorAvailabilityStatus.IN_PROGRESS) {
        throw new BadRequestException(
          'Only in progress requests can be approved',
        );
      }

      if (current.approvedBy && current.approvedBy !== adminId) {
        throw new BadRequestException(
          'approved_by does not match the admin who started processing this request',
        );
      }

      // 1. Update Mentor Availability Status
      current.status = MentorAvailabilityStatus.APPROVED;
      current.note = note;
      const updated = await manager.save(MentorAvailabilityEntity, current);

      // 2. Update User Role to MENTOR
      const user = await manager.findOne(UserEntity, {
        where: { id: current.mentorId },
      });
      if (user) {
        user.role = UserRole.MENTOR;
        await manager.save(UserEntity, user);
      }

      // 3. Create or Update Mentor Profile
      let profile = await manager.findOne(MentorProfileEntity, {
        where: { userId: current.mentorId },
      });

      if (!profile) {
        profile = manager.create(MentorProfileEntity, {
          userId: current.mentorId,
          status: MentorProfileStatus.ACTIVE,
        });
      }

      profile.jobTitle = current.jobTitle;
      profile.company = current.company;
      profile.bio = current.bio;
      profile.linkedinUrl = current.linkedinUrl;
      profile.yearsOfExperience = current.yearsOfExperience;
      profile.skills = current.skills;
      profile.isApproved = true;
      profile.approvedBy = adminId;
      profile.status = MentorProfileStatus.ACTIVE;

      await manager.save(MentorProfileEntity, profile);

      return mentorAvailabilitySchema.parse(updated);
    });
  }


  async reject(id: string, adminId: string, note: string) {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MentorAvailabilityEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Mentor availability not found');
      }

      if (current.status !== MentorAvailabilityStatus.IN_PROGRESS) {
        throw new BadRequestException(
          'Only in progress requests can be rejected',
        );
      }

      if (current.approvedBy && current.approvedBy !== adminId) {
        throw new BadRequestException(
          'approved_by does not match the admin who started processing this request',
        );
      }

      current.status = MentorAvailabilityStatus.REJECTED;
      current.note = note;

      const updated = await manager.save(MentorAvailabilityEntity, current);
      return mentorAvailabilitySchema.parse(updated);
    });
  }

  async cancel(id: string, menteeId: string) {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MentorAvailabilityEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Mentor availability not found');
      }

      if (current.mentorId !== menteeId) {
        throw new BadRequestException('Only the owner can cancel this request');
      }

      if (current.status !== MentorAvailabilityStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be canceled');
      }

      current.status = MentorAvailabilityStatus.CANCEL;

      const updated = await manager.save(MentorAvailabilityEntity, current);
      return mentorAvailabilitySchema.parse(updated);
    });
  }

  async remove(id: string) {
    await this.mentorAvailabilityRepository.softDeleteById(id);
  }
}
