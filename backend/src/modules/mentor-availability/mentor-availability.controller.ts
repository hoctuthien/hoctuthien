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
import { MentorAvailabilityService } from './services/mentor-availability.service';
import {
  CreateMentorAvailabilityInput,
  UpdateMentorAvailabilityInput,
} from './types/mentor-availability.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@Controller('mentor-availabilities')
export class MentorAvailabilityController {
  constructor(private readonly mentorAvailabilityService: MentorAvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  create(
    @Body() payload: CreateMentorAvailabilityInput,
    @User('id') mentorId: string,
  ) {
    return this.mentorAvailabilityService.create(mentorId, payload);
  }

  @Get()
  findAll() {
    return this.mentorAvailabilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentorAvailabilityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateMentorAvailabilityInput) {
    return this.mentorAvailabilityService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorAvailabilityService.remove(id);
  }
}
