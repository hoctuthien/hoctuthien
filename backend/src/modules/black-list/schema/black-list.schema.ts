export type BlackListSchema = {
  name: string;
};

export const black-listSchema = {
  parse: <T>(payload: T) => payload,
};
