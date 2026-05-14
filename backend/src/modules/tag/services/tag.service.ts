import { Injectable } from '@nestjs/common';
import { TagRepository } from '../repositories/tag.repository';
import { TagEntity } from '../entities/tag.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(data: DeepPartial<TagEntity>): Promise<TagEntity> {
    return this.tagRepository.createAndSave(data);
  }

  async findAll(): Promise<TagEntity[]> {
    return this.tagRepository.findMany();
  }

  async findOne(id: string): Promise<TagEntity> {
    return this.tagRepository.findByIdOrFail(id);
  }

  async update(id: string, data: DeepPartial<TagEntity>): Promise<TagEntity> {
    return this.tagRepository.updateById(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.tagRepository.softDeleteById(id);
  }
}
