import { Injectable, NotFoundException } from '@nestjs/common';
import { PenaltyTicketRepository } from '../repositories/penalty-ticket.repository';
import {
  createPenaltyTicketSchema,
  updatePenaltyTicketSchema,
  penaltyTicketSchema,
} from '../schema/penalty-ticket.schema';
import {
  CreatePenaltyTicketInput,
  UpdatePenaltyTicketInput,
} from '../types/penalty-ticket.types';

@Injectable()
export class PenaltyTicketService {
  constructor(private readonly penaltyTicketRepository: PenaltyTicketRepository) {}

  async findAll() {
    const items = await this.penaltyTicketRepository.findMany();
    return items.map(item => penaltyTicketSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.penaltyTicketRepository.findById(id);
    if (!item) throw new NotFoundException('Penalty ticket not found');
    return penaltyTicketSchema.parse(item);
  }

  async create(payload: CreatePenaltyTicketInput) {
    const parsed = createPenaltyTicketSchema.parse(payload);
    const created = await this.penaltyTicketRepository.createAndSave(parsed);
    return penaltyTicketSchema.parse(created);
  }

  async update(id: string, payload: UpdatePenaltyTicketInput) {
    const parsed = updatePenaltyTicketSchema.parse(payload);
    const updated = await this.penaltyTicketRepository.updateById(id, parsed);
    return penaltyTicketSchema.parse(updated);
  }

  async remove(id: string) {
    await this.penaltyTicketRepository.softDeleteById(id);
  }
}
