import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { createPaymentSchema, updatePaymentSchema, paymentSchema } from '../schema/payment.schema';
import { CreatePaymentInput, UpdatePaymentInput } from '../types/payment.types';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findAll() {
    const items = await this.paymentRepository.findMany();
    return items.map(item => paymentSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.paymentRepository.findById(id);
    if (!item) throw new NotFoundException('Payment not found');
    return paymentSchema.parse(item);
  }

  async create(payload: CreatePaymentInput) {
    const parsed = createPaymentSchema.parse(payload);
    const created = await this.paymentRepository.createAndSave(parsed);
    return paymentSchema.parse(created);
  }

  async update(id: string, payload: UpdatePaymentInput) {
    const parsed = updatePaymentSchema.parse(payload);
    const updated = await this.paymentRepository.updateById(id, parsed);
    return paymentSchema.parse(updated);
  }

  async remove(id: string) {
    await this.paymentRepository.softDeleteById(id);
  }
}
