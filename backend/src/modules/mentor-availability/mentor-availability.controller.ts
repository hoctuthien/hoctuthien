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
import {
  MentorAvailabilityEmptyActionDto,
  MentorAvailabilityReviewDto,
} from './dtos/mentor-availability-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

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
  create(
    @Body() payload: CreateMentorAvailabilityInput,
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
  findAll() {
    return this.mentorAvailabilityService.findAll();
  }

  /**
   * @description Lấy danh sách các yêu cầu làm Mentor của bản thân
   * @access Mentee (Role.MENTEE)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
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
   * @access Chưa phân quyền (Cần xem xét bổ sung Guard)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateMentorAvailabilityInput,
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
  cancel(
    @Param('id') id: string,
    @Body() _payload: MentorAvailabilityEmptyActionDto,
    @User('id') menteeId: string,
  ) {
    return this.mentorAvailabilityService.cancel(id, menteeId);
  }

  /**
   * @description Xóa yêu cầu làm Mentor
   * @access Chưa phân quyền (Cần xem xét bổ sung Guard)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorAvailabilityService.remove(id);
  }
}
