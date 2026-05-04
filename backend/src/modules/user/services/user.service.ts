import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
  publicUserSchema,
} from '../schema/user.schema';
import { CreateUserInput, UpdateUserInput } from '../types/user.types';
import { Role } from '../../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findMany();
    return users.map((user) => publicUserSchema.parse(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    return publicUserSchema.parse(user);
  }

  async getMe(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException(
        'Tài khoản của bạn đã bị khóa bởi quản trị viên.',
      );
    }

    return publicUserSchema.parse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    // Trả về full schema (bao gồm passwordHash) vì chỉ dùng nội bộ cho auth
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
    return publicUserSchema.parse(created);
  }

  async update(
    id: string,
    payload: UpdateUserInput,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    // Chỉ ADMIN hoặc chính user đó mới được cập nhật
    if (requestingUserRole !== Role.ADMIN && requestingUserId !== id) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật thông tin của người dùng khác.',
      );
    }

    const parsed = updateUserSchema.parse(payload);

    // Người dùng thông thường không được tự đổi role, points, isVerified
    if (requestingUserRole !== Role.ADMIN) {
      delete (parsed as any).role;
      delete (parsed as any).points;
      delete (parsed as any).isVerified;
      delete (parsed as any).status;
    }

    const updated = await this.userRepository.updateById(id, parsed);
    return publicUserSchema.parse(updated);
  }

  async remove(id: string) {
    await this.userRepository.softDeleteById(id);
  }

  /**
   * Kích hoạt tài khoản Mentee sau khi thanh toán phí kích hoạt thành công.
   * Đặt isVerified = true — FE/middleware dùng field này để cho phép truy cập đầy đủ.
   */
  async activateMentee(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    await this.userRepository.updateById(id, { isVerified: true });
  }
}
