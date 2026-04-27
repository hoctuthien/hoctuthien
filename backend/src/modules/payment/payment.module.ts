import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { VietqrService } from './services/vietqr.service';
import { TnAppService } from './services/tn-app.service';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { vietqrConfig } from '../../config/vietqr.config';
import { tnAppConfig } from '../../config/tn-app.config';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    HttpModule,
    ConfigModule.forFeature(vietqrConfig),
    ConfigModule.forFeature(tnAppConfig),
    SystemConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, VietqrService, TnAppService],
  exports: [PaymentService, PaymentRepository, VietqrService, TnAppService],
})
export class PaymentModule {}
