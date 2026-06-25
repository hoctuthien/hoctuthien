import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BadgeService } from './services/badge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('badges')
@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user badges' })
  @UseGuards(JwtAuthGuard)
  getMyBadges(@User('id') userId: string) {
    return this.badgeService.getUserBadges(userId);
  }

  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get badges for a user (public)' })
  getUserBadges(@Param('userId') userId: string) {
    return this.badgeService.getUserBadges(userId);
  }
}
