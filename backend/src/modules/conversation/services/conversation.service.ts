import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ConversationService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Conversation id is required');
    }

    return {
      id,
      message: 'Conversation fetched successfully',
    };
  }
}
