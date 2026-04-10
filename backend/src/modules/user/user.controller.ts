import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './services/user.service';
import {
  CreateUserInput,
  GoogleUserProfile,
  UpdateUserInput,
} from './types/user.types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateUserInput) {
    return this.userService.create(payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserInput) {
    return this.userService.update(id, payload);
  }

  @Post('google-upsert')
  upsertGoogleUser(@Body() profile: GoogleUserProfile) {
    return this.userService.upsertGoogleUser(profile);
  }
}
