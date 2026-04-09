import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';

export type AppJwtPayload = JwtPayload & {
  sub: string;
  email?: string;
  role?: string;
};

export const signToken = (
  payload: AppJwtPayload,
  secret: string,
  expiresIn: SignOptions['expiresIn'],
): string => {
  return sign(payload, secret, { expiresIn });
};

export const verifyToken = <T extends object = AppJwtPayload>(
  token: string,
  secret: string,
): T => {
  return verify(token, secret) as T;
};

export const parseBearerToken = (authorization?: string): string | null => {
  if (!authorization) return null;
  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
};
