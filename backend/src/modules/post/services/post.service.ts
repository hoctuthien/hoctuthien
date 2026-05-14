import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostEntity } from '../entities/post.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(data: DeepPartial<PostEntity>): Promise<PostEntity> {
    return this.postRepository.createAndSave(data);
  }

  async findAll(): Promise<PostEntity[]> {
    return this.postRepository.findMany({
      relations: ['author', 'category', 'coverImage', 'postTags', 'postTags.tag'],
    });
  }

  async findOne(id: string): Promise<PostEntity> {
    return this.postRepository.findByIdOrFail(id, 'Post not found');
  }

  async update(id: string, data: DeepPartial<PostEntity>): Promise<PostEntity> {
    return this.postRepository.updateById(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.postRepository.softDeleteById(id);
  }
}
