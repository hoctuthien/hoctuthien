import { Injectable } from '@nestjs/common';
import { UserSessionRepository } from '../repositories/user-session.repository';
import {
  createUserSessionSchema,
  updateUserSessionSchema,
  userSessionSchema,
} from '../schema/user-session.schema';
import { CreateUserSessionInput, UpdateUserSessionInput } from '../types/user-session.types';

@Injectable()
export class UserSessionService {
  constructor(private readonly userSessionRepository: UserSessionRepository) {}

  async findOne(id: string) {
    const session = await this.userSessionRepository.findById(id);
    return session ? userSessionSchema.parse(session) : null;
  }

  async create(payload: CreateUserSessionInput) {
    const parsed = createUserSessionSchema.parse(payload);
    const created = await this.userSessionRepository.createAndSave({
      ...parsed,
      deviceName: parsed.deviceName ?? null,
      deviceType: parsed.deviceType ?? null,
      userAgent: parsed.userAgent ?? null,
      ipAddress: parsed.ipAddress ?? null,
      metadata: parsed.metadata ?? {},
      status: parsed.status ?? 'active',
    });

    return userSessionSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserSessionInput) {
    const parsed = updateUserSessionSchema.parse(payload);
    const updated = await this.userSessionRepository.updateById(id, parsed);
    return userSessionSchema.parse(updated);
  }
}
