import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentStrategy } from '../../payment/interfaces/payment-strategy.interface';
import { PaymentEntity } from '../../payment/entities/payment.entity';
import {
  CourseBookingEntity,
  BookingStatus,
} from '../entities/course-booking.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { CourseBookingService } from '../services/course-booking.service';

@Injectable()
export class CourseBookingPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(CourseBookingPaymentStrategy.name);
  readonly paymentType = 'course_booking';

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseBookingService: CourseBookingService,
  ) {}

  async resolveAmount(
    referenceId: string,
    customAmount?: number,
  ): Promise<number> {
    const booking = await this.dataSource
      .getRepository(CourseBookingEntity)
      .findOne({
        where: { id: referenceId },
      });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy thông tin đăng ký khóa học.');
    }

    const course = await this.dataSource.getRepository(CourseEntity).findOne({
      where: { id: booking.courseId },
    });
    if (!course) {
      throw new NotFoundException('Không tìm thấy thông tin khóa học.');
    }

    return Number(course.price);
  }

  resolveDescriptionPrefix(referenceId: string): string {
    return 'DANGKY';
  }

  async onGenerate(payment: PaymentEntity, referenceId: string): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(CourseBookingEntity)
      .set({ paymentId: payment.id })
      .where('id = :id', { id: referenceId })
      .execute();

    this.logger.log(
      `[CourseBookingStrategy] Đã liên kết Payment ${payment.id} với Booking ${referenceId}`,
    );
  }

  async onSuccess(payment: PaymentEntity): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(CourseBookingEntity)
      .set({ status: BookingStatus.CONFIRMED })
      .where('payment_id = :paymentId', { paymentId: payment.id })
      .execute();

    this.logger.log(
      `[CourseBookingStrategy] Thanh toán thành công! Đã xác nhận Booking liên kết với Payment ${payment.id}`,
    );

    try {
      const booking = await this.dataSource
        .getRepository(CourseBookingEntity)
        .findOne({
          where: { paymentId: payment.id },
        });

      if (booking) {
        void this.courseBookingService
          .sendBookingNotificationEmails(booking.id)
          .catch((err) => {
            this.logger.error(
              `Failed to send post-payment notification emails for booking ${booking.id}: ${err?.message || err}`,
            );
          });
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch booking for payment ${payment.id} notification: ${error?.message || error}`,
      );
    }
  }
}
