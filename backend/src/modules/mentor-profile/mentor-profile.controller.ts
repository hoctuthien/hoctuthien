import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Mentor Profiles')
@Controller('mentor-profiles')
export class MentorProfileController {
  constructor(private readonly mentorProfileService: MentorProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN)
  async updateMe(
    @User('id') userId: string,
    @User('role') userRole: string,
    @Body() payload: UpdateMentorProfileDto,
  ) {
    const profile = await this.mentorProfileService.findByUserId(userId);
    return this.mentorProfileService.update(profile.id, payload, userId, userRole);
  }

  @Get(':id')
  @ApiFindOneMentorProfileDoc()
  @Public()
  findOne(@Param('id') id: string) {
    return this.mentorProfileService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiUpdateMentorProfileDoc()
  update(
    @Param('id') id: string,
    @Body() payload: UpdateMentorProfileDto,
    @User('id') requestingUserId: string,
    @User('role') requestingUserRole: string,
  ) {
    return this.mentorProfileService.update(id, payload, requestingUserId, requestingUserRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiRemoveMentorProfileDoc()
  remove(@Param('id') id: string) {
    return this.mentorProfileService.remove(id);
  }
}
