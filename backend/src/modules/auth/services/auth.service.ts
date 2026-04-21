import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../user/entities/user.entity';
import { LoginDto } from '../dtos/auth.dto';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { REDIS_CLIENT } from 'src/modules/redis/redis.module';
import Redis from 'ioredis';
import { AuthRepository } from '../repositories/auth.repository';
import { authEntitySchema, createAuthInputSchema, updateAuthInputSchema } from '../schema/auth.schema';
import { CreateAuthDataInput, UpdateAuthDataInput } from '../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  // --- Auth CRUD Methods ---

  async findAll() {
    const items = await this.authRepository.findMany();
    return items.map(item => authEntitySchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.authRepository.findById(id);
    if (!item) throw new NotFoundException('Auth record not found');
    return authEntitySchema.parse(item);
  }

  async create(payload: CreateAuthDataInput) {
    const parsed = createAuthInputSchema.parse(payload);
    const created = await this.authRepository.createAndSave(parsed);
    return authEntitySchema.parse(created);
  }

  async update(id: string, payload: UpdateAuthDataInput) {
    const parsed = updateAuthInputSchema.parse(payload);
    const updated = await this.authRepository.updateById(id, parsed);
    return authEntitySchema.parse(updated);
  }

  async remove(id: string) {
    await this.authRepository.softDeleteById(id);
  }

  // --- Auth Logic ---

  async testRedis() {
    // 1. Lưu một giá trị vào Redis (sau 10 giây tự xóa)
    await this.redis.set('my_key', 'hello_redis', 'EX', 10);
    // 2. Lấy giá trị ra
    const value = await this.redis.get('my_key');
    console.log('Giá trị lấy từ Redis là:', value);
  }
  async login(loginDto: LoginDto) {
    const { email, password, deviceId } = loginDto;

    // 1. Tìm User & Kiểm tra mật khẩu
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS); // email không tồn tại hoặc user đăng nhập bằng Google (không có passwordHash)
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS); // sai mật khẩu
    }

    // 2. TẠO ACCESS TOKEN
    const payload = { sub: user.id, email: user.email, deviceId: deviceId };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
    }); // Token hết hạn sau 1 giờ

    // 3. TẠO REFRESH TOKEN
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
    });

    // 4. LƯU REFRESH TOKEN GỐC VÀO DATABASE
    // await this.userRepository.update(user.id, {
    //   refreshTokenHash: refreshToken, //  tên cột là Hash nhưng tạm lưu gốc vào đây luôn :))
    // });

    // 5. TRẢ VỀ CHO FRONTEND
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    };
  }
}
