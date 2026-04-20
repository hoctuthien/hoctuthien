import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './services/user-session.service';
import { UserSessionEntity } from './entities/user-session.entity';
import { UserSessionRepository } from './repositories/user-session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserSessionEntity])],
  controllers: [UserSessionController],
  providers: [UserSessionService, UserSessionRepository],
  exports: [UserSessionService, UserSessionRepository],
})
export class UserSessionModule {}
