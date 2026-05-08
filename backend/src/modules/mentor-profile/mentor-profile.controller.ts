import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MentorProfileService } from './services/mentor-profile.service';
import {
  CreateMentorProfileDto,
  UpdateMentorProfileDto,
} from './dtos/mentor-profile.dto';
import {
  ApiCreateMentorProfileDoc,
  ApiFindAllMentorProfilesDoc,
  ApiFindOneMentorProfileDoc,
  ApiFindMentorProfileByUserIdDoc,
  ApiUpdateMentorProfileDoc,
  ApiRemoveMentorProfileDoc,
} from './swagger/mentor-profile.swagger';

@ApiTags('Mentor Profiles')
@Controller('mentor-profiles')
export class MentorProfileController {
  constructor(private readonly mentorProfileService: MentorProfileService) {}

  @Post()
  @ApiCreateMentorProfileDoc()
  create(@Body() payload: CreateMentorProfileDto) {
    return this.mentorProfileService.create(payload);
  }

  @Get()
  @ApiFindAllMentorProfilesDoc()
  findAll() {
    return this.mentorProfileService.findAll();
  }

  @Get('user/:userId')
  @ApiFindMentorProfileByUserIdDoc()
  findByUserId(@Param('userId') userId: string) {
    return this.mentorProfileService.findByUserId(userId);
  }

  @Get(':id')
  @ApiFindOneMentorProfileDoc()
  findOne(@Param('id') id: string) {
    return this.mentorProfileService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateMentorProfileDoc()
  update(@Param('id') id: string, @Body() payload: UpdateMentorProfileDto) {
    return this.mentorProfileService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveMentorProfileDoc()
  remove(@Param('id') id: string) {
    return this.mentorProfileService.remove(id);
  }
}
