import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../repositories/conversation.repository';
import {
  createConversationSchema,
  updateConversationSchema,
  conversationSchema,
} from '../schema/conversation.schema';
import {
  CreateConversationInput,
  UpdateConversationInput,
} from '../types/conversation.types';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async findAll() {
    const items = await this.conversationRepository.findMany();
    return items.map((item) => conversationSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.conversationRepository.findById(id);
    if (!item) throw new NotFoundException('Conversation not found');
    return conversationSchema.parse(item);
  }

  async create(payload: CreateConversationInput) {
    const parsed = createConversationSchema.parse(payload);
    const created = await this.conversationRepository.createAndSave(parsed);
    return conversationSchema.parse(created);
  }

  async update(id: string, payload: UpdateConversationInput) {
    const parsed = updateConversationSchema.parse(payload);
    const updated = await this.conversationRepository.updateById(id, parsed);
    return conversationSchema.parse(updated);
  }

  async remove(id: string) {
    await this.conversationRepository.softDeleteById(id);
  }
}
