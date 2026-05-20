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
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CreateUserInput, UpdateUserInput } from './types/user.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from 'src/common/decorators/user.decorator';
import {
  ApiGetMeDoc,
  ApiCreateUserDoc,
  ApiFindAllUsersDoc,
  ApiFindOneUserDoc,
  ApiUpdateUserDoc,
  ApiRemoveUserDoc,
} from './swagger/user.swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMeDoc()
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
  @ApiCreateUserDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() payload: CreateUserInput) {
    return this.userService.create(payload);
  }

  @Get()
  @ApiFindAllUsersDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiFindOneUserDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateUserDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateUserInput,
    @User('id') requestingUserId: string,
    @User('role') requestingUserRole: string,
  ) {
    return this.userService.update(
      id,
      payload,
      requestingUserId,
      requestingUserRole,
    );
  }

  @Delete(':id')
  @ApiRemoveUserDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
