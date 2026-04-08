import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('User id is required');
    }

    return {
      id,
      message: 'User fetched successfully',
    };
  }
}
