import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseBookingController } from './course-booking.controller';
import { CourseBookingService } from './services/course-booking.service';
import { CourseBookingEntity } from './entities/course-booking.entity';
import { CourseBookingRepository } from './repositories/course-booking.repository';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseBookingEntity]),
    CourseModule, // import để dùng CourseRepository kiểm tra ownership
  ],
  controllers: [CourseBookingController],
  providers: [CourseBookingService, CourseBookingRepository],
  exports: [CourseBookingService, CourseBookingRepository],
})
export class CourseBookingModule {}
