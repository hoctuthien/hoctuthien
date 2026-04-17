export interface IConversationService {
  findOne(id: string): Promise<unknown>;
}
