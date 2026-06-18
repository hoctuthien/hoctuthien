import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MentorAvailabilityService } from './services/mentor-availability.service';
import {
  CreateMentorAvailabilityDto,
  UpdateMentorAvailabilityDto,
  FindAllMentorAvailabilitiesQueryDto,
} from './dtos/mentor-availability.dto';
import {
  MentorAvailabilityEmptyActionDto,
  MentorAvailabilityReviewDto,
} from './dtos/mentor-availability-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiCreateMentorAvailabilityDoc,
  ApiFindAllMentorAvailabilitiesDoc,
  ApiFindMyMentorAvailabilitiesDoc,
  ApiFindOneMentorAvailabilityDoc,
  ApiUpdateToInProgressDoc,
  ApiApproveMentorAvailabilityDoc,
  ApiRejectMentorAvailabilityDoc,
  ApiCancelMentorAvailabilityDoc,
} from './swagger/mentor-availability.swagger';

@ApiTags('Mentor Availabilities (Applications)')
@Controller('mentor-availabilities')
export class MentorAvailabilityController {
  constructor(
    private readonly mentorAvailabilityService: MentorAvailabilityService,
  ) {}

  /**
   * @description Đăng ký/Tạo mới yêu cầu làm Mentor (Mentee gửi yêu cầu)
   * @access Mentee (Role.MENTEE)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  @ApiCreateMentorAvailabilityDoc()
  create(
    @Body() payload: CreateMentorAvailabilityDto,
    @User('id') mentorId: string,
  ) {
    return this.mentorAvailabilityService.create(mentorId, payload);
  }

  /**
   * @description Lấy danh sách tất cả các yêu cầu làm Mentor (Dành cho Admin duyệt)
   * @access Admin (Role.ADMIN) - CẦN ADMIN
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiFindAllMentorAvailabilitiesDoc()
  findAll(@Query() query: FindAllMentorAvailabilitiesQueryDto) {
    return this.mentorAvailabilityService.findAll(query);
  }

  /**
   * @description Lấy danh sách các yêu cầu làm Mentor của bản thân
   * @access Mentee (Role.MENTEE)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  @ApiFindMyMentorAvailabilitiesDoc()
  findMyMentorAvailabilities(@User('id') mentorId: string) {
    return this.mentorAvailabilityService.findByMentorId(mentorId);
  }

  /**
   * @description Lấy chi tiết một yêu cầu làm Mentor theo ID (Dành cho Admin)
   * @access Admin (Role.ADMIN) - CẦN ADMIN
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiFindOneMentorAvailabilityDoc()
  findOneAdmin(@Param('id') id: string) {
    return this.mentorAvailabilityService.findOne(id);
  }

  /**
   * @description Lấy chi tiết một yêu cầu làm Mentor của bản thân theo ID
   * @access Mentee (Role.MENTEE)
   */
  @Get('me/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  findOneMine(@Param('id') id: string, @User('id') mentorId: string) {
    return this.mentorAvailabilityService.findOneForMentor(id, mentorId);
  }

  /**
   * @description Cập nhật thông tin yêu cầu làm Mentor
   * @access Admin (Role.ADMIN) hoặc Mentee (Role.MENTEE)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTEE)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateMentorAvailabilityDto,
  ) {
    return this.mentorAvailabilityService.update(id, payload);
  }

  /**
   * @description Chuyển trạng thái yêu cầu sang Đang xử lý (In Progress)
   * @access Admin (Role.ADMIN) - CẦN ADMIN
   */
  @Patch(':id/in-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiUpdateToInProgressDoc()
  updateToInProgress(
    @Param('id') id: string,
    @Body() _payload: MentorAvailabilityEmptyActionDto,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.updateToInProgress(id, adminId);
  }

  /**
   * @description Phê duyệt yêu cầu làm Mentor
   * @access Admin (Role.ADMIN) - CẦN ADMIN
   */
  @Patch(':id/approved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiApproveMentorAvailabilityDoc()
  approve(
    @Param('id') id: string,
    @Body() payload: MentorAvailabilityReviewDto,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.approve(id, adminId, payload.note);
  }

  /**
   * @description Từ chối yêu cầu làm Mentor
   * @access Admin (Role.ADMIN) - CẦN ADMIN
   */
  @Patch(':id/rejected')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiRejectMentorAvailabilityDoc()
  reject(
    @Param('id') id: string,
    @Body() payload: MentorAvailabilityReviewDto,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.reject(id, adminId, payload.note);
  }

  /**
   * @description Hủy yêu cầu làm Mentor (Mentee tự hủy)
   * @access Mentee (Role.MENTEE)
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  @ApiCancelMentorAvailabilityDoc()
  cancel(
    @Param('id') id: string,
    @Body() _payload: MentorAvailabilityEmptyActionDto,
    @User('id') menteeId: string,
  ) {
    return this.mentorAvailabilityService.cancel(id, menteeId);
  }

  /**
   * @description Xóa yêu cầu làm Mentor
   * @access Admin (Role.ADMIN)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.mentorAvailabilityService.remove(id);
  }
}
