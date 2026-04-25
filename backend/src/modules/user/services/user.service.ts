import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findMany();
    return users.map(user => userSchema.parse(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    return userSchema.parse(user);
  }

  async getMe(id: string) {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('Tài khoản của bạn đã bị khóa bởi quản trị viên.');
    }

    return userSchema.parse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return user ? userSchema.parse(user) : null;
  }

  async create(payload: CreateUserInput) {
    const parsed = createUserSchema.parse(payload);
    
    // Tự động hash mật khẩu nếu có
    const userData: any = { ...parsed };
    if (parsed.password) {
      userData.passwordHash = await bcrypt.hash(parsed.password, 10);
      delete userData.password; // Xóa trường password thô
    }

    const created = await this.userRepository.createAndSave(userData);
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
