import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorProfileController } from './mentor-profile.controller';
import { MentorProfileService } from './services/mentor-profile.service';
import { MentorProfileEntity } from './entities/mentor-profile.entity';
import { MentorProfileRepository } from './repositories/mentor-profile.repository';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([MentorProfileEntity]), MailModule],
  controllers: [MentorProfileController],
  providers: [MentorProfileService, MentorProfileRepository],
  exports: [MentorProfileService, MentorProfileRepository],
})
export class MentorProfileModule {}
