import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseBookingController } from './course-booking.controller';
import { CourseBookingService } from './services/course-booking.service';
import { CourseBookingEntity } from './entities/course-booking.entity';
import { CourseBookingRepository } from './repositories/course-booking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseBookingEntity])],
  controllers: [CourseBookingController],
  providers: [CourseBookingService, CourseBookingRepository],
  exports: [CourseBookingService, CourseBookingRepository],
})
export class CourseBookingModule {}
