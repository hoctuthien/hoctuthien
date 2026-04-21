import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SystemConfigService } from './services/system-config.service';
import {
  CreateSystemConfigInput,
  UpdateSystemConfigInput,
} from './types/system-config.types';

@Controller('system-configs')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  create(@Body() payload: CreateSystemConfigInput) {
    return this.systemConfigService.create(payload);
  }

  @Get()
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemConfigService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateSystemConfigInput) {
    return this.systemConfigService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemConfigService.remove(id);
  }
}
