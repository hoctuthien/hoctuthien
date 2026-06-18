import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { PaymentEntity, PaymentType } from '../entities/payment.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SystemConfigService } from '../../system-config/services/system-config.service';

const ACTIVATION_FEE_CONFIG_KEY = 'activation_fee';
const ACTIVATION_FEE_DEFAULT = 5_000;

@Injectable()
export class ActivationPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(ActivationPaymentStrategy.name);
  readonly paymentType = PaymentType.ACTIVATION;

  constructor(
    private readonly systemConfigService: SystemConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async resolveAmount(
    referenceId: string,
    customAmount?: number,
  ): Promise<number> {
    let amount = ACTIVATION_FEE_DEFAULT;
    try {
      const config = await this.systemConfigService.findByKey(
        ACTIVATION_FEE_CONFIG_KEY,
      );
      if (config && typeof config.configValue === 'number') {
        amount = config.configValue;
      }
    } catch {
      this.logger.warn(
        `Không tìm thấy config '${ACTIVATION_FEE_CONFIG_KEY}'. Dùng fallback: ${ACTIVATION_FEE_DEFAULT} VND.`,
      );
    }
    return amount;
  }

  resolveDescriptionPrefix(referenceId: string): string {
    return 'KICHHOAT';
  }

  async onGenerate(payment: PaymentEntity, referenceId: string): Promise<void> {
    // Không cần liên kết thực thể bổ sung cho kích hoạt tài khoản
    return;
  }

  async onSuccess(payment: PaymentEntity): Promise<void> {
    const userId = payment.userId;
    await this.dataSource
      .createQueryBuilder()
      .update(UserEntity)
      .set({ isVerified: true })
      .where('id = :id', { id: userId })
      .execute();

    this.logger.log(
      `[ActivationStrategy] Kích hoạt thành công tài khoản Mentee: userId=${userId}`,
    );
  }
}
