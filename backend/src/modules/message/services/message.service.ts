import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import {
  createMessageSchema,
  updateMessageSchema,
  messageSchema,
} from '../schema/message.schema';
import { CreateMessageInput, UpdateMessageInput } from '../types/message.types';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async findAll() {
    const items = await this.messageRepository.findMany();
    return items.map((item) => messageSchema.parse(item));
  }

  async findByConversation(conversationId: string) {
    const items = await this.messageRepository.findMany({
      where: { conversationId } as any,
    });
    return items.map((item) => messageSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.messageRepository.findById(id);
    if (!item) throw new NotFoundException('Message not found');
    return messageSchema.parse(item);
  }

  async create(payload: CreateMessageInput) {
    const parsed = createMessageSchema.parse(payload);
    const created = await this.messageRepository.createAndSave(parsed);
    return messageSchema.parse(created);
  }

  async update(id: string, payload: UpdateMessageInput) {
    const parsed = updateMessageSchema.parse(payload);
    const updated = await this.messageRepository.updateById(id, parsed);
    return messageSchema.parse(updated);
  }

  async remove(id: string) {
    await this.messageRepository.softDeleteById(id);
  }
}
