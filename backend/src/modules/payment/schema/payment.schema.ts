export type PaymentSchema = {
  name: string;
};

export const paymentSchema = {
  parse: <T>(payload: T) => payload,
};
