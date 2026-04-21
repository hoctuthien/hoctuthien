import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MentorProfileService } from './services/mentor-profile.service';
import {
  CreateMentorProfileInput,
  UpdateMentorProfileInput,
} from './types/mentor-profile.types';

@Controller('mentor-profiles')
export class MentorProfileController {
  constructor(private readonly mentorProfileService: MentorProfileService) {}

  @Post()
  create(@Body() payload: CreateMentorProfileInput) {
    return this.mentorProfileService.create(payload);
  }

  @Get()
  findAll() {
    return this.mentorProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentorProfileService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateMentorProfileInput) {
    return this.mentorProfileService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorProfileService.remove(id);
  }
}
