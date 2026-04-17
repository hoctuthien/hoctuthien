export interface INotificationService {
  findOne(id: string): Promise<unknown>;
}
