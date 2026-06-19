import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseBookingController } from './course-booking.controller';
import { CourseBookingService } from './services/course-booking.service';
import { CourseBookingEntity } from './entities/course-booking.entity';
import { CourseBookingRepository } from './repositories/course-booking.repository';
import { CourseModule } from '../course/course.module';
import { PaymentModule } from '../payment/payment.module';
import { PaymentStrategyRegistry } from '../payment/services/payment-strategy.registry';
import { CourseBookingPaymentStrategy } from './strategies/course-booking-payment.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseBookingEntity]),
    CourseModule, // import để dùng CourseRepository kiểm tra ownership
    PaymentModule, // import để dùng PaymentStrategyRegistry và tích hợp thanh toán
    MailModule,
  ],
  controllers: [CourseBookingController],
  providers: [
    CourseBookingService,
    CourseBookingRepository,
    CourseBookingPaymentStrategy,
  ],
  exports: [
    CourseBookingService,
    CourseBookingRepository,
    CourseBookingPaymentStrategy,
  ],
})
export class CourseBookingModule implements OnModuleInit {
  constructor(
    private readonly registry: PaymentStrategyRegistry,
    private readonly courseBookingStrategy: CourseBookingPaymentStrategy,
  ) {}

  onModuleInit() {
    this.registry.register(this.courseBookingStrategy);
  }
}
