import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
