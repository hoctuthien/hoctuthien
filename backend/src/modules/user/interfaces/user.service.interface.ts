import {
  CreateUserInput,
  GoogleUserProfile,
  UpdateUserInput,
  User,
} from '../types/user.types';

export interface IUserService {
  findOne(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(payload: CreateUserInput): Promise<User>;
  update(id: string, payload: UpdateUserInput): Promise<User>;
  updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<User>;
  upsertGoogleUser(profile: GoogleUserProfile): Promise<User>;
}
