import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BlackListService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('BlackList id is required');
    }

    return {
      id,
      message: 'BlackList fetched successfully',
    };
  }
}
