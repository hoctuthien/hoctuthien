export interface ICourseService {
  findOne(id: string): Promise<unknown>;
}
