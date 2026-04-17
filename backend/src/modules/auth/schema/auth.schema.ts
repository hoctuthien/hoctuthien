export type AuthSchema = {
  name: string;
};

export const authSchema = {
  parse: <T>(payload: T) => payload,
};
