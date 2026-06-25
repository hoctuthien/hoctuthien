import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignService } from './services/campaign.service';
import { CampaignStatus } from './entities/campaign.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List campaigns (public)' })
  findAll(
    @Query('status') status?: CampaignStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.campaignService.findAll(status, Number(page), Number(limit));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get campaign detail (public)' })
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign (ADMIN only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() payload: any, @User('id') userId: string) {
    return this.campaignService.create(payload, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign (ADMIN only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() payload: any) {
    return this.campaignService.update(id, payload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete campaign (ADMIN only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
