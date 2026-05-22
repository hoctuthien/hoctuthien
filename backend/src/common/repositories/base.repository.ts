import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(protected readonly repo: Repository<T>) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repo.createQueryBuilder(alias);
  }

  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(
    id: string,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });
  }

  async findByIdOrFail(id: string, message = 'Resource not found'): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(message);
    return entity;
  }

  async findOne(
    where: FindOptionsWhere<T>,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null> {
    return this.repo.findOne({ where, ...options });
  }

  async findMany(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  async findManyWithCount(
    options?: FindManyOptions<T>,
  ): Promise<[T[], number]> {
    return this.repo.findAndCount(options);
  }

  async updateById(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findByIdOrFail(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async softDeleteById(id: string): Promise<void> {
    const result = await this.repo.softDelete(id);
    if (!result.affected) throw new NotFoundException('Resource not found');
  }

  async restoreById(id: string): Promise<void> {
    const result = await this.repo.restore(id);
    if (!result.affected) throw new NotFoundException('Resource not found');
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return this.repo.exist({ where });
  }
}
