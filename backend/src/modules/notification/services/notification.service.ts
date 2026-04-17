import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Notification id is required');
    }

    return {
      id,
      message: 'Notification fetched successfully',
    };
  }
}
