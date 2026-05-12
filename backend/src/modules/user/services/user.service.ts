import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRepository } from '../repositories/user.repository';
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
} from '../schema/user.schema';
import { CreateUserInput, UpdateUserInput } from '../types/user.types';
import * as bcrypt from 'bcrypt';
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../../payment/events/payment.events';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findMany();
    return users.map((user) => userSchema.parse(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    return userSchema.parse(user);
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

  /**
   * Lắng nghe event payment.success do PaymentVerificationService phát ra.
   *
   * Đây là điểm tich hợp duy nhất giữa Payment domain và User domain.
   * PaymentVerificationService không cần biết về UserService hay UserEntity.
   */
  @OnEvent(PAYMENT_SUCCESS_EVENT, { async: true })
  async handlePaymentSuccess(payload: PaymentSuccessPayload): Promise<void> {
    this.logger.log(
      `[Event] Nhận payment.success: paymentId=${payload.paymentId}, userId=${payload.userId}`,
    );

    try {
      await this.activateMentee(payload.userId);
      this.logger.log(
        `[Event] Kích hoạt thành công tài khoản Mentee: userId=${payload.userId}`,
      );
    } catch (error) {
      // Ghi log lỗi nhưng KHÔNG re-throw — tránh crash event loop của các listener khác
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Event] Kích hoạt thất bại cho userId=${payload.userId}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
