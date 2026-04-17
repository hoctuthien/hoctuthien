export interface ICourseBookingService {
  findOne(id: string): Promise<unknown>;
}
