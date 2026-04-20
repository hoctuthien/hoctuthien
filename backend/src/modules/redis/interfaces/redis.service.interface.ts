export interface IRedisService {
  findOne(id: string): Promise<unknown>;
}
