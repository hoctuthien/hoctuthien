import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MentorAvailabilityService } from './services/mentor-availability.service';
import {
  CreateMentorAvailabilityInput,
  UpdateMentorAvailabilityInput,
} from './types/mentor-availability.types';

@Controller('mentor-availabilities')
export class MentorAvailabilityController {
  constructor(private readonly mentorAvailabilityService: MentorAvailabilityService) {}

  @Post()
  create(@Body() payload: CreateMentorAvailabilityInput) {
    return this.mentorAvailabilityService.create(payload);
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
