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
import { UserRepository } from '../../user/repositories/user.repository';
import { PenaltyTicketStatus } from '../entities/penalty-ticket.entity';

@Injectable()
export class PenaltyTicketService {
  constructor(
    private readonly penaltyTicketRepository: PenaltyTicketRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll() {
    const items = await this.penaltyTicketRepository.findMany();
    return items.map((item) => penaltyTicketSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.penaltyTicketRepository.findById(id);
    if (!item) throw new NotFoundException('Penalty ticket not found');
    return penaltyTicketSchema.parse(item);
  }

  async create(payload: CreatePenaltyTicketInput) {
    const parsed = createPenaltyTicketSchema.parse(payload);
    
    // Set default status to pending if not specified
    if (!parsed.status) {
      parsed.status = PenaltyTicketStatus.PENDING;
    }

    const created = await this.penaltyTicketRepository.createAndSave(parsed);

    // If status is PENALTY (e.g. created directly with PENALTY status), deduct points immediately
    if (created.status === PenaltyTicketStatus.PENALTY && created.pointsDeducted > 0) {
      const user = await this.userRepository.findById(created.userId);
      if (user) {
        const newPoints = Math.max(0, (user.points || 0) - created.pointsDeducted);
        await this.userRepository.updateById(user.id, { points: newPoints });
      }
    }

    return penaltyTicketSchema.parse(created);
  }

  async update(id: string, payload: UpdatePenaltyTicketInput, adminId?: string) {
    const oldTicket = await this.penaltyTicketRepository.findById(id);
    if (!oldTicket) throw new NotFoundException('Penalty ticket not found');

    const parsed = updatePenaltyTicketSchema.parse(payload);

    const oldStatus = oldTicket.status;
    const newStatus = parsed.status ?? oldStatus;
    const oldPoints = oldTicket.pointsDeducted;
    const newPoints = parsed.pointsDeducted ?? oldPoints;

    // Save ticket with updatedBy if admin is updating
    const updated = await this.penaltyTicketRepository.updateById(id, {
      ...parsed,
      updatedBy: adminId ?? parsed.updatedBy,
    });

    // Handle user points adjustment based on status transition
    const user = await this.userRepository.findById(oldTicket.userId);
    if (user) {
      let currentPoints = user.points || 0;

      if (oldStatus !== PenaltyTicketStatus.PENALTY && newStatus === PenaltyTicketStatus.PENALTY) {
        // Transition to PENALTY -> deduct points
        currentPoints = Math.max(0, currentPoints - newPoints);
      } else if (oldStatus === PenaltyTicketStatus.PENALTY && newStatus !== PenaltyTicketStatus.PENALTY) {
        // Transition from PENALTY to another status (rejected/cancel) -> restore points
        currentPoints = currentPoints + oldPoints;
      } else if (oldStatus === PenaltyTicketStatus.PENALTY && newStatus === PenaltyTicketStatus.PENALTY && oldPoints !== newPoints) {
        // Stay in PENALTY, but points value changed -> adjust difference
        const diff = newPoints - oldPoints;
        currentPoints = Math.max(0, currentPoints - diff);
      }

      await this.userRepository.updateById(user.id, { points: currentPoints });
    }

    return penaltyTicketSchema.parse(updated);
  }

  async remove(id: string) {
    const oldTicket = await this.penaltyTicketRepository.findById(id);
    if (oldTicket && oldTicket.status === PenaltyTicketStatus.PENALTY && oldTicket.pointsDeducted > 0) {
      // If a penalty ticket is deleted, restore points to the user
      const user = await this.userRepository.findById(oldTicket.userId);
      if (user) {
        const newPoints = (user.points || 0) + oldTicket.pointsDeducted;
        await this.userRepository.updateById(user.id, { points: newPoints });
      }
    }
    await this.penaltyTicketRepository.softDeleteById(id);
  }
}
