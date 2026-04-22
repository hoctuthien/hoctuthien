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
import { UserService } from './services/user.service';
import { CreateUserInput, UpdateUserInput } from './types/user.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
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
  create(@Body() payload: CreateUserInput) {
    return this.userService.create(payload);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserInput) {
    return this.userService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
