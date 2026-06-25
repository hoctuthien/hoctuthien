import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './services/admin-stats.service';
import { UserEntity } from '../user/entities/user.entity';
import { MentorProfileEntity } from '../mentor-profile/entities/mentor-profile.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { CourseBookingEntity } from '../course-booking/entities/course-booking.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MentorProfileEntity,
      CourseEntity,
      CourseBookingEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
  exports: [AdminStatsService],
})
export class AdminModule {}
