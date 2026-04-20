import { Controller, Get, Param } from '@nestjs/common';
import { UserSessionService } from './services/user-session.service';

@Controller('user-sessions')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSessionService.findOne(id);
  }
}
