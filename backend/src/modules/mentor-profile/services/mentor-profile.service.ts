import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
import { Role } from '../../../common/enums/role.enum';
import { MailService } from '../../mail/services/mail.service';
import { MentorProfileStatus } from '../enums/mentor-profile-status.enum';

@Injectable()
export class MentorProfileService {
  constructor(
    private readonly mentorProfileRepository: MentorProfileRepository,
    private readonly mailService: MailService,
  ) {}

  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
    skills?: string;
    minExperience?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    const [items, total] =
      await this.mentorProfileRepository.findActiveMentorsWithFilters({
        page,
        limit,
        search: query?.search,
        skills: query?.skills,
        minExperience: query?.minExperience,
      });

    const { createPaginationMeta } =
      await import('../../../common/utils/pagination.util');

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
    const item = await this.mentorProfileRepository.findOne(
      { userId },
      { relations: ['user'] },
    );
    if (!item)
      throw new NotFoundException('Mentor profile not found for this user');
    return mentorProfileSchema.parse(item);
  }

  async create(payload: CreateMentorProfileDto) {
    const parsed = createMentorProfileSchema.parse(payload);
    const created = await this.mentorProfileRepository.createAndSave(parsed);
    return mentorProfileSchema.parse(created);
  }

  async update(
    id: string,
    payload: UpdateMentorProfileDto,
    requestingUserId?: string,
    requestingUserRole?: string,
  ) {
    const profile = await this.mentorProfileRepository.findById(id);
    if (!profile) throw new NotFoundException('Mentor profile not found');

    if (requestingUserRole && requestingUserId) {
      if (requestingUserRole !== Role.ADMIN && profile.userId !== requestingUserId) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật hồ sơ của người khác.',
        );
      }
    }

    const parsed = updateMentorProfileSchema.parse(payload);

    if (requestingUserRole && requestingUserRole !== Role.ADMIN) {
      delete (parsed as any).isApproved;
      delete (parsed as any).approvedBy;
      delete (parsed as any).averageRating;
      delete (parsed as any).totalStudents;
      delete (parsed as any).status;
    }

    const updated = await this.mentorProfileRepository.updateById(id, parsed);

    // Gửi email thông báo nếu admin thay đổi status approved/rejected
    if (requestingUserRole === Role.ADMIN) {
      const becameApproved = parsed.status === MentorProfileStatus.ACTIVE && !profile.isApproved && parsed.isApproved;
      const becameRejected = parsed.status === MentorProfileStatus.REJECTED;

      if (becameApproved || becameRejected) {
        const mentorUser = await this.mentorProfileRepository.findById(id, {
          relations: ['user'],
        });
        if (mentorUser?.user?.email) {
          void this.mailService
            .sendMentorApprovalEmail({
              to: mentorUser.user.email,
              recipientName: mentorUser.user.name,
              approved: becameApproved,
              rejectReason: null,
            })
            .catch(() => undefined);
        }
      }
    }

    return mentorProfileSchema.parse(updated);
  }

  async remove(id: string) {
    await this.mentorProfileRepository.softDeleteById(id);
  }
}
