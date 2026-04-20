import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RedisService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Redis id is required');
    }

    return {
      id,
      message: 'Redis fetched successfully',
    };
  }
}
