import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppLogger } from '../../../common/logger/app-logger.service';
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
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../../payment/events/payment.events';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  async findAll() {
    this.logger.debug({}, 'findAll -> entry');
    const users = await this.userRepository.findMany();
    return users.map((user) => publicUserSchema.parse(user));
  }

  async findOne(id: string) {
    this.logger.debug({ userId: id }, 'findOne -> entry');
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    return publicUserSchema.parse(user);
  }

  async getMe(id: string) {
    this.logger.debug({ userId: id }, 'getMe -> entry');
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
    this.logger.debug({ email }, 'findByEmail -> entry');
    const user = await this.userRepository.findByEmail(email);
    // Trả về full schema (bao gồm passwordHash) vì chỉ dùng nội bộ cho auth
    return user ? userSchema.parse(user) : null;
  }

  async create(payload: CreateUserInput) {
    this.logger.debug({ email: payload.email }, 'create -> entry');
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
    this.logger.debug(
      { targetUserId: id, requestingUserId },
      'update -> entry',
    );
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
    this.logger.debug({ userId: id }, 'remove -> entry');
    await this.userRepository.softDeleteById(id);
  }

  /**
   * Kích hoạt tài khoản Mentee sau khi thanh toán phí kích hoạt thành công.
   * Đặt isVerified = true — FE/middleware dùng field này để cho phép truy cập đầy đủ.
   */
  async activateMentee(id: string): Promise<void> {
    this.logger.debug({ userId: id }, 'activateMentee -> entry');
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
      {
        paymentId: payload.paymentId,
        userId: payload.userId,
        paymentMethod: payload.paymentMethod,
      },
      '[Event] Nhận payment.success',
    );

    // Chỉ kích hoạt tài khoản nếu loại payment là ACTIVATION
    if (payload.paymentMethod !== 'activation') {
      return;
    }

    try {
      await this.activateMentee(payload.userId);
      this.logger.log(
        { userId: payload.userId },
        '[Event] Kích hoạt thành công tài khoản Mentee',
      );
    } catch (error) {
      // Ghi log lỗi nhưng KHÔNG re-throw — tránh crash event loop của các listener khác
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        {
          userId: payload.userId,
          errorMessage: message,
          stack: error instanceof Error ? error.stack : undefined,
        },
        '[Event] Kích hoạt thất bại cho userId',
      );
    }
  }
}
