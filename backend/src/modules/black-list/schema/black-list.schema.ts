export type BlackListSchema = {
  name: string;
};

export const blackListSchema = {
  parse: <T>(payload: T) => payload,
};
