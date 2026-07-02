import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BugReportRepository } from '../repositories/bug-report.repository';
import {
  createBugReportSchema,
  updateBugReportSchema,
  bugReportSchema,
} from '../schema/bug-report.schema';
import {
  CreateBugReportInput,
  UpdateBugReportInput,
} from '../types/bug-report.types';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class BugReportService {
  constructor(
    private readonly bugReportRepository: BugReportRepository,
  ) {}

  async create(payload: CreateBugReportInput, userId: string) {
    const parsed = createBugReportSchema.parse(payload);
    const created = await this.bugReportRepository.createAndSave({
      ...parsed,
      userId,
    });
    return bugReportSchema.parse(created);
  }

  async findAll(requestingUserId: string, requestingUserRole: string) {
    let items;
    if (requestingUserRole === Role.ADMIN) {
      items = await this.bugReportRepository.findMany({
        order: { createdAt: 'DESC' },
      });
    } else {
      items = await this.bugReportRepository.findMany({
        where: { userId: requestingUserId },
        order: { createdAt: 'DESC' },
      });
    }
    return items.map((item) => bugReportSchema.parse(item));
  }

  async findOne(id: string, requestingUserId: string, requestingUserRole: string) {
    const item = await this.bugReportRepository.findById(id);
    if (!item) throw new NotFoundException('Bug report not found');

    if (
      requestingUserRole !== Role.ADMIN &&
      item.userId !== requestingUserId
    ) {
      throw new ForbiddenException('Bạn không có quyền xem báo cáo lỗi này.');
    }

    return bugReportSchema.parse(item);
  }

  async update(id: string, payload: UpdateBugReportInput) {
    const item = await this.bugReportRepository.findById(id);
    if (!item) throw new NotFoundException('Bug report not found');

    const parsed = updateBugReportSchema.parse(payload);
    const updated = await this.bugReportRepository.updateById(id, parsed);
    return bugReportSchema.parse(updated);
  }

  async remove(id: string) {
    const item = await this.bugReportRepository.findById(id);
    if (!item) throw new NotFoundException('Bug report not found');

    await this.bugReportRepository.softDeleteById(id);
  }
}
