import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
} from '../schema/user.schema';
import {
  CreateUserInput,
  UpdateUserInput,
} from '../types/user.types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findMany();
    return users.map(user => userSchema.parse(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return userSchema.parse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return user ? userSchema.parse(user) : null;
  }

  async create(payload: CreateUserInput) {
    const parsed = createUserSchema.parse(payload);
    const created = await this.userRepository.createAndSave(parsed);
    return userSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserInput) {
    const parsed = updateUserSchema.parse(payload);
    const updated = await this.userRepository.updateById(id, parsed);
    return userSchema.parse(updated);
  }

  async remove(id: string) {
    await this.userRepository.softDeleteById(id);
  }
}
