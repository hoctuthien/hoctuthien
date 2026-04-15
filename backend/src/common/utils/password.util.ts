import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 10;

export const hashPassword = async (
  password: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
