import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PenaltyTicketService } from './services/penalty-ticket.service';
import {
  CreatePenaltyTicketInput,
  UpdatePenaltyTicketInput,
} from './types/penalty-ticket.types';

@Controller('penalty-tickets')
export class PenaltyTicketController {
  constructor(private readonly penaltyTicketService: PenaltyTicketService) {}

  @Post()
  create(@Body() payload: CreatePenaltyTicketInput) {
    return this.penaltyTicketService.create(payload);
  }

  @Get()
  findAll() {
    return this.penaltyTicketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.penaltyTicketService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePenaltyTicketInput) {
    return this.penaltyTicketService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.penaltyTicketService.remove(id);
  }
}
