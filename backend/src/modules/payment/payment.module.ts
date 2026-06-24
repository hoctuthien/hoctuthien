import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { VietqrService } from './services/vietqr.service';
import { TnAppService } from './services/tn-app.service';
import { PaymentVerificationService } from './services/payment-verification.service';
import { PaymentSuccessListener } from './listeners/payment-success.listener';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { vietqrConfig } from '../../config/vietqr.config';
import { tnAppConfig } from '../../config/tn-app.config';
import { SystemConfigModule } from '../system-config/system-config.module';
import { PaymentStrategyRegistry } from './services/payment-strategy.registry';
import { ActivationPaymentStrategy } from './strategies/activation-payment.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    HttpModule,
    ConfigModule.forFeature(vietqrConfig),
    ConfigModule.forFeature(tnAppConfig),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    SystemConfigModule,
    MailModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    VietqrService,
    TnAppService,
    PaymentVerificationService,
    PaymentSuccessListener,
    PaymentStrategyRegistry,
    ActivationPaymentStrategy,
  ],
  exports: [
    PaymentService,
    PaymentRepository,
    VietqrService,
    TnAppService,
    PaymentStrategyRegistry,
    ActivationPaymentStrategy,
  ],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    private readonly registry: PaymentStrategyRegistry,
    private readonly activationStrategy: ActivationPaymentStrategy,
  ) {}

  onModuleInit() {
    this.registry.register(this.activationStrategy);
  }
}
