import { PaymentEntity } from '../entities/payment.entity';

export interface IPaymentService {
  findOne(id: string): Promise<PaymentEntity>;

  generateActivationQr(userId: string): Promise<{
    paymentId: string;
    amount: number;
    transactionCode: string;
    qrUrl: string;
    expiredAt: Date;
  }>;

  verifyActivationPayment(
    userId: string,
    paymentId: string,
  ): Promise<{ activated: boolean; message: string }>;
}
