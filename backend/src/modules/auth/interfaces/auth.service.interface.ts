export interface IAuthService {
  findOne(id: string): Promise<unknown>;
}
