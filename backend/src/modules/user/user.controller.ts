import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CreateUserInput, UpdateUserInput } from './types/user.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin user thành công' })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  async getMe(@User('id') userId: string) {
    const result = await this.userService.getMe(userId);

    return {
      message: 'Lấy thông tin người dùng thành công.',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        avatarUrl: result.avatarUrl,
        dayOfBirth: result.dayOfBirth,
        gender: result.gender,
        role: result.role,
        points: result.points,
        isVerified: result.isVerified,
        status: result.status,
        timezone: result.timezone,
        preferences: result.preferences,
        createdAt: result.createdAt,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiResponse({ status: 201, description: 'Tạo user thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  create(@Body() payload: CreateUserInput) {
    return this.userService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách user' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách user thành công' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết user theo id' })
  @ApiParam({
    name: 'id',
    description: 'ID của user',
    example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
  })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết user thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật user theo id' })
  @ApiParam({
    name: 'id',
    description: 'ID của user',
    example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật user thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  update(@Param('id') id: string, @Body() payload: UpdateUserInput) {
    return this.userService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user theo id' })
  @ApiParam({
    name: 'id',
    description: 'ID của user',
    example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
  })
  @ApiResponse({ status: 200, description: 'Xóa user thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
