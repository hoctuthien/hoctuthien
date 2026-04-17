import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PaymentService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Payment id is required');
    }

    return {
      id,
      message: 'Payment fetched successfully',
    };
  }
}
