import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserSessionService } from './services/user-session.service';
import { CreateUserSessionInput, UpdateUserSessionInput } from './types/user-session.types';

@Controller('user-sessions')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Post()
  create(@Body() payload: CreateUserSessionInput) {
    return this.userSessionService.create(payload);
  }

  @Get()
  findAll() {
    return this.userSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSessionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserSessionInput) {
    return this.userSessionService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSessionService.remove(id);
  }
}
