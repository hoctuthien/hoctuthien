export type RedisSchema = {
  name: string;
};

export const redisSchema = {
  parse: <T>(payload: T) => payload,
};
