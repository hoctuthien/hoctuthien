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
import { SystemConfigService } from './services/system-config.service';
import {
  CreateSystemConfigInput,
  UpdateSystemConfigInput,
} from './types/system-config.types';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@Controller('system-configs')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body() payload: CreateSystemConfigInput,
    @User('id') adminId: string,
  ) {
    return this.systemConfigService.create({ ...payload, createdBy: adminId });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Get('public/:key')
  @Public()
  findPublicByKey(@Param('key') key: string) {
    return this.systemConfigService.findPublicByKey(key);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.systemConfigService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateSystemConfigInput,
  ) {
    return this.systemConfigService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.systemConfigService.remove(id);
  }
}
