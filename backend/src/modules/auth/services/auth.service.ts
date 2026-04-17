import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../user/entities/user.entity'; // <--- Dùng UserEntity
import { LoginDto } from '../dtos/auth.dto';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) // <--- Tiêm UspuerRepository vào
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  // Hàm lấy thông tin User (ví dụ cho API GET /auths/:id)


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
    await this.userRepository.update(user.id, {
      refreshTokenHash: refreshToken, //  tên cột là Hash nhưng tạm lưu gốc vào đây luôn :))
    });

    // 5. TRẢ VỀ CHO FRONTEND
    return {
      access_token: accessToken,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    };
  }
}
