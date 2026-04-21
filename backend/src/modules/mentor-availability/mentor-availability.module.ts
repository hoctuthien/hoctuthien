import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorAvailabilityController } from './mentor-availability.controller';
import { MentorAvailabilityService } from './services/mentor-availability.service';
import { MentorAvailabilityEntity } from './entities/mentor-availability.entity';
import { MentorAvailabilityRepository } from './repositories/mentor-availability.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MentorAvailabilityEntity])],
  controllers: [MentorAvailabilityController],
  providers: [MentorAvailabilityService, MentorAvailabilityRepository],
  exports: [MentorAvailabilityService, MentorAvailabilityRepository],
})
export class MentorAvailabilityModule {}
