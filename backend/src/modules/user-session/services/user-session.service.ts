import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSessionRepository } from '../repositories/user-session.repository';
import {
  createUserSessionSchema,
  updateUserSessionSchema,
  userSessionSchema,
} from '../schema/user-session.schema';
import {
  CreateUserSessionInput,
  UpdateUserSessionInput,
} from '../types/user-session.types';

@Injectable()
export class UserSessionService {
  constructor(private readonly userSessionRepository: UserSessionRepository) {}

  async findAll() {
    const items = await this.userSessionRepository.findMany();
    return items.map((item) => userSessionSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.userSessionRepository.findById(id);
    if (!item) throw new NotFoundException('User Session not found');
    return userSessionSchema.parse(item);
  }

  async findOneBy(where: any) {
    const item = await this.userSessionRepository.findOne(where);
    return item ? userSessionSchema.parse(item) : null;
  }

  async create(payload: CreateUserSessionInput) {
    const parsed = createUserSessionSchema.parse(payload);
    const created = await this.userSessionRepository.createAndSave(parsed);
    return userSessionSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserSessionInput) {
    const parsed = updateUserSessionSchema.parse(payload);
    const updated = await this.userSessionRepository.updateById(id, parsed);
    return userSessionSchema.parse(updated);
  }

  async remove(id: string) {
    await this.userSessionRepository.softDeleteById(id);
  }
}
