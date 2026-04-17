export interface IReviewService {
  findOne(id: string): Promise<unknown>;
}
