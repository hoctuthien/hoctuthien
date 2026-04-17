export interface ICourseReviewService {
  findOne(id: string): Promise<unknown>;
}
