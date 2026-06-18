import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';

@Injectable()
export class PaymentStrategyRegistry {
  private readonly strategies = new Map<string, PaymentStrategy>();

  /**
   * Đăng ký một chiến lược thanh toán vào hệ thống.
   */
  register(strategy: PaymentStrategy) {
    this.strategies.set(strategy.paymentType, strategy);
  }

  /**
   * Lấy chiến lược thanh toán tương ứng với loại thanh toán.
   */
  get(paymentType: string): PaymentStrategy {
    const strategy = this.strategies.get(paymentType);
    if (!strategy) {
      throw new BadRequestException(
        `Không hỗ trợ loại thanh toán: ${paymentType}`,
      );
    }
    return strategy;
  }
}
