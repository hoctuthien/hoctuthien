import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PenaltyTicketService } from './services/penalty-ticket.service';
import {
  CreatePenaltyTicketInput,
  UpdatePenaltyTicketInput,
} from './types/penalty-ticket.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@Controller('penalty-tickets')
export class PenaltyTicketController {
  constructor(private readonly penaltyTicketService: PenaltyTicketService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() payload: CreatePenaltyTicketInput,
    @User('id') reportedById: string,
  ) {
    return this.penaltyTicketService.create({
      ...payload,
      reportedById,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.penaltyTicketService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.penaltyTicketService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() payload: UpdatePenaltyTicketInput,
    @User('id') adminId: string,
  ) {
    return this.penaltyTicketService.update(id, payload, adminId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.penaltyTicketService.remove(id);
  }
}
