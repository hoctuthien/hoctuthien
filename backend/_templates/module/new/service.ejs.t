---
to: src/modules/<%= name %>/services/<%= name %>.service.ts
---
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class <%= className %>Service {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('<%= className %> id is required');
    }

    return {
      id,
      message: '<%= className %> fetched successfully',
    };
  }
}
