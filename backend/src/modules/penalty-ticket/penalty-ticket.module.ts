import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenaltyTicketController } from './penalty-ticket.controller';
import { PenaltyTicketService } from './services/penalty-ticket.service';
import { PenaltyTicketEntity } from './entities/penalty-ticket.entity';
import { PenaltyTicketRepository } from './repositories/penalty-ticket.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([PenaltyTicketEntity]), UserModule],
  controllers: [PenaltyTicketController],
  providers: [PenaltyTicketService, PenaltyTicketRepository],
  exports: [PenaltyTicketService, PenaltyTicketRepository],
})
export class PenaltyTicketModule {}
