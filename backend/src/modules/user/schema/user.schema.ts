export type UserSchema = {
  name: string;
};

export const userSchema = {
  parse: <T>(payload: T) => payload,
};
