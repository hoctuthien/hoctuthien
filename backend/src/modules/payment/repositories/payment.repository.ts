import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PaymentEntity, PaymentType } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';


@Injectable()
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    repo: Repository<PaymentEntity>,
  ) {
    super(repo);
  }

  /**
   * Tìm giao dịch Kích hoạt tài khoản đang PENDING mới nhất của user.
   * Dùng để kiểm tra xem user đã có QR chờ thanh toán chưa trước khi tạo mới.
   */
  async findPendingActivation(userId: string): Promise<PaymentEntity | null> {
    return this.repo.findOne({
      where: {
        userId,
        paymentMethod: PaymentType.ACTIVATION,
        status: PaymentStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cập nhật trạng thái payment và merge thêm dữ liệu vào cột vietqr_payload.
   * Spread operator đảm bảo dữ liệu cũ trong JSONB không bị mất.
   */
  async updatePayment(
    paymentId: string,
    status: PaymentStatus,
    vietqrDataUpdate?: Record<string, any>,
  ): Promise<PaymentEntity> {
    const payment = await this.findByIdOrFail(
      paymentId,
      'Không tìm thấy thông tin thanh toán.',
    );

    payment.status = status;

    if (vietqrDataUpdate) {
      payment.vietqrPayload = {
        ...payment.vietqrPayload,
        ...vietqrDataUpdate,
      };
    }

    return this.repo.save(payment);
  }

  /**
   * Expire một payment cụ thể theo ID.
   * Dùng trong Lazy Expiry: khi phát hiện payment PENDING đã quá hạn.
   */
  async expirePayment(paymentId: string): Promise<void> {
    await this.repo.update(
      { id: paymentId },
      { status: PaymentStatus.EXPIRED },
    );
  }

  /**
   * Bulk-expire tất cả payment PENDING có expiredAt < now.
   * Có thể gọi từ cron job hoặc khi cần làm sạch dữ liệu.
   * @returns Số lượng bản ghi bị expire.
   */
  async expireStaleActivations(): Promise<number> {
    const result = await this.repo.update(
      {
        paymentMethod: PaymentType.ACTIVATION,
        status: PaymentStatus.PENDING,
        expiredAt: LessThan(new Date()),
      },
      { status: PaymentStatus.EXPIRED },
    );
    return result.affected ?? 0;
  }
}
