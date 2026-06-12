import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { MentorProfileService } from './services/mentor-profile.service';
import {
  CreateMentorProfileDto,
  UpdateMentorProfileDto,
  FindAllMentorProfilesQueryDto,
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
  constructor(private readonly mentorProfileService: MentorProfileService) { }

  @Post()
  @ApiCreateMentorProfileDoc()
  create(@Body() payload: CreateMentorProfileDto) {
    return this.mentorProfileService.create(payload);
  }

  @Get()
  @ApiFindAllMentorProfilesDoc()
  @Public()
  findAll(@Query() query: FindAllMentorProfilesQueryDto) {
    return this.mentorProfileService.findAll(query);
  }

  @Get('user/:userId')
  @ApiFindMentorProfileByUserIdDoc()
  @Public()
  findByUserId(@Param('userId') userId: string) {
    return this.mentorProfileService.findByUserId(userId);
  }

  @Get(':id')
  @ApiFindOneMentorProfileDoc()
  @Public()
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
