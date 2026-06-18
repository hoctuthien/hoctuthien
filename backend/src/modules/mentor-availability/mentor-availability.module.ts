import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorAvailabilityController } from './mentor-availability.controller';
import { MentorAvailabilityService } from './services/mentor-availability.service';
import { MentorAvailabilityEntity } from './entities/mentor-availability.entity';
import { MentorAvailabilityRepository } from './repositories/mentor-availability.repository';
import { MentorAvailabilityResolver } from './mentor-availability.resolver';
import { MentorProfileModule } from '../mentor-profile/mentor-profile.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorAvailabilityEntity]),
    MentorProfileModule,
    UserModule,
  ],
  controllers: [MentorAvailabilityController],
  providers: [
    MentorAvailabilityService,
    MentorAvailabilityRepository,
    MentorAvailabilityResolver,
  ],
  exports: [MentorAvailabilityService, MentorAvailabilityRepository],
})
export class MentorAvailabilityModule {}
