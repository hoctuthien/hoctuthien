export interface IBugReportService {
  findOne(id: string): Promise<unknown>;
}
