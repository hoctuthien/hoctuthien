import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminStatsService } from './services/admin-stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('admin-stats')
@Controller('admin')
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics (ADMIN only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getDashboardStats() {
    return this.adminStatsService.getDashboardStats();
  }

  @Get('leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get leaderboard for mentors or mentees (public)' })
  @ApiQuery({ name: 'type', enum: ['mentor', 'mentee'], required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  getLeaderboard(
    @Query('type') type: 'mentor' | 'mentee' = 'mentor',
    @Query('limit') limit = 10,
  ) {
    return this.adminStatsService.getLeaderboard(type, Number(limit));
  }

  @Get('transparency')
  @Public()
  @ApiOperation({ summary: 'Get financial transparency data (public)' })
  getTransparencyData() {
    return this.adminStatsService.getTransparencyData();
  }
}
