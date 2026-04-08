export interface IUserService {
  findOne(id: string): Promise<unknown>;
}
