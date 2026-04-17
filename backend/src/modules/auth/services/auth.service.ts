import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from '../dtos/auth.dto';


@Injectable()
export class AuthService {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Auth id is required');
    }

    return {
      id,
      message: 'Auth fetched successfully',
    };
  }

  async login(loginDto: LoginDto) {
    // 1. Lấy hoặc tạo Device ID
    const deviceId = loginDto.deviceId || uuidv4();

    console.log('Device ID hiện tại là:', deviceId);

    // 2. Logic kiểm tra User (Mô phỏng)
    const { email, password } = loginDto;

    // Đoạn này sau này để gọi sang UserService:
    // const user = await this.userService.findByEmail(email);
    // if (!user || !comparePassword(password, user.password)) {
    //   throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    // }

    // 3. Trả về kết quả (Tạm thời trả về deviceId để test)
    return {
      message: 'Đăng nhập thành công',
      data: {
        email,
        deviceId,
        accessToken: 'mock_token_abc123', // Sau này sẽ dùng JwtService để tạo
      },
    };
  }
}
