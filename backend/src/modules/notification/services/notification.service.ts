import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { createNotificationSchema, updateNotificationSchema, notificationSchema } from '../schema/notification.schema';
import { CreateNotificationInput, UpdateNotificationInput } from '../types/notification.types';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async findAll() {
    const items = await this.notificationRepository.findMany();
    return items.map(item => notificationSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.notificationRepository.findById(id);
    if (!item) throw new NotFoundException('Notification not found');
    return notificationSchema.parse(item);
  }

  async create(payload: CreateNotificationInput) {
    const parsed = createNotificationSchema.parse(payload);
    const created = await this.notificationRepository.createAndSave(parsed);
    return notificationSchema.parse(created);
  }

  async update(id: string, payload: UpdateNotificationInput) {
    const parsed = updateNotificationSchema.parse(payload);
    const updated = await this.notificationRepository.updateById(id, parsed);
    return notificationSchema.parse(updated);
  }

  async remove(id: string) {
    await this.notificationRepository.softDeleteById(id);
  }
}
