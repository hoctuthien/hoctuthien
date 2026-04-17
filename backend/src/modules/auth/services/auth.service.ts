import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Auth id is required');
    }

    return {
      id,
      message: 'Auth fetched successfully',
    };
  }
}
