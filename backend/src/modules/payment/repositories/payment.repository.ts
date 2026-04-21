import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    repo: Repository<PaymentEntity>,
  ) {
    super(repo);
  }
}
