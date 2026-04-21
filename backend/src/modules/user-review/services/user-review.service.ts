import { Injectable, NotFoundException } from '@nestjs/common';
import { UserReviewRepository } from '../repositories/user-review.repository';
import {
  createUserReviewSchema,
  updateUserReviewSchema,
  userReviewSchema,
} from '../schema/user-review.schema';
import {
  CreateUserReviewInput,
  UpdateUserReviewInput,
} from '../types/user-review.types';

@Injectable()
export class UserReviewService {
  constructor(private readonly userReviewRepository: UserReviewRepository) {}

  async findAll() {
    const items = await this.userReviewRepository.findMany();
    return items.map(item => userReviewSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.userReviewRepository.findById(id);
    if (!item) throw new NotFoundException('User review not found');
    return userReviewSchema.parse(item);
  }

  async create(payload: CreateUserReviewInput) {
    const parsed = createUserReviewSchema.parse(payload);
    const created = await this.userReviewRepository.createAndSave(parsed);
    return userReviewSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserReviewInput) {
    const parsed = updateUserReviewSchema.parse(payload);
    const updated = await this.userReviewRepository.updateById(id, parsed);
    return userReviewSchema.parse(updated);
  }

  async remove(id: string) {
    await this.userReviewRepository.softDeleteById(id);
  }
}
