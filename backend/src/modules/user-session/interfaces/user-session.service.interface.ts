import {
  CreateUserSessionInput,
  UpdateUserSessionInput,
} from '../types/user-session.types';

export interface IUserSessionService {
  findOne(id: string): Promise<unknown | null>;
  create(payload: CreateUserSessionInput): Promise<unknown>;
  update(id: string, payload: UpdateUserSessionInput): Promise<unknown>;
}
