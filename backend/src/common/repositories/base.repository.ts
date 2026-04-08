import { BaseEntity, DeepPartial, Repository } from 'typeorm';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(private readonly repository: Repository<T>) {}

  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
}
