import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import {
  createUserSchema,
  googleUserProfileSchema,
  updateRefreshTokenSchema,
  updateUserSchema,
  userSchema,
} from '../schema/user.schema';
import {
  CreateUserInput,
  GoogleUserProfile,
  UpdateUserInput,
} from '../types/user.types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOne(id: string) {
    const user = await this.userRepository.findByIdOrFail(id, 'User not found');
    return userSchema.parse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return user ? userSchema.parse(user) : null;
  }

  async findByGoogleId(googleId: string) {
    const user = await this.userRepository.findByGoogleId(googleId);
    return user ? userSchema.parse(user) : null;
  }

  async create(payload: CreateUserInput) {
    const parsed = createUserSchema.parse(payload);
    const created = await this.userRepository.createAndSave({
      ...parsed,
      role: parsed.role ?? 'mentee',
      isVerified: parsed.isVerified ?? false,
      status: parsed.status ?? 'active',
    });

    return userSchema.parse(created);
  }

  async update(id: string, payload: UpdateUserInput) {
    const parsed = updateUserSchema.parse(payload);
    const updated = await this.userRepository.updateById(id, parsed);
    return userSchema.parse(updated);
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    const parsed = updateRefreshTokenSchema.parse({ userId, refreshTokenHash });
    const user = await this.userRepository.findById(parsed.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokenHash = parsed.refreshTokenHash;
    const saved = await this.userRepository.updateById(parsed.userId, {
      refreshTokenHash: parsed.refreshTokenHash,
    });

    return userSchema.parse(saved);
  }

  async upsertGoogleUser(profile: GoogleUserProfile) {
    const parsedProfile = googleUserProfileSchema.parse(profile);

    let user = await this.userRepository.findByGoogleId(parsedProfile.sub);

    if (!user) {
      user = await this.userRepository.findByEmail(parsedProfile.email);
    }

    if (!user) {
      const created = await this.create({
        googleId: parsedProfile.sub,
        email: parsedProfile.email,
        name: parsedProfile.name,
        avatarUrl: parsedProfile.picture,
        isVerified: true,
      });

      return created;
    }

    return this.update(user.id, {
      googleId: user.googleId ?? parsedProfile.sub,
      name: parsedProfile.name,
      avatarUrl: parsedProfile.picture,
      isVerified: true,
      status: 'active',
    });
  }
}
