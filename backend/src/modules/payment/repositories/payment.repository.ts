import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
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

  async expirePayment(paymentId: string): Promise<void> {
    await this.repo.update(
      { id: paymentId },
      { status: PaymentStatus.EXPIRED },
    );
  }

  // Bulk-expire tất cả payment PENDING đã quá expiredAt — có thể gọi từ cron job
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

  /**
   * Lấy tất cả payment PENDING + ACTIVATION + chưa hết hạn.
   * Dùng bởi Cron job để đối soát với TN App.
   *
   * @param limit Giới hạn số records (mặc định 20 — đủ cho MVP)
   * @returns Mảng PaymentEntity, cũ nhất trước (FIFO)
   */
  async findAllPendingActive(limit = 20): Promise<PaymentEntity[]> {
    return this.repo.find({
      where: {
        paymentMethod: PaymentType.ACTIVATION,
        status: PaymentStatus.PENDING,
        expiredAt: MoreThan(new Date()),
      },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
