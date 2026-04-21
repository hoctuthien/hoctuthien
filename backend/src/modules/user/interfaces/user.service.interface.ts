import {
  CreateUserInput,
  UpdateUserInput,
  User,
} from '../types/user.types';

export interface IUserService {
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  create(payload: CreateUserInput): Promise<User>;
  update(id: string, payload: UpdateUserInput): Promise<User>;
  remove(id: string): Promise<void>;
}
