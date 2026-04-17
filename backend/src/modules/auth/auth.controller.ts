import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './services/auth.service';

@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }
}
