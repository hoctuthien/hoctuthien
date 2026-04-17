export interface IPaymentService {
  findOne(id: string): Promise<unknown>;
}
