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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourseBookingService } from './services/course-booking.service';
import {
  CreateCourseBookingInput,
  UpdateCourseBookingInput,
  UpdateCourseBookingByMenteeInput,
  FindCourseBookingsQuery,
} from './types/course-booking.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiCreateCourseBookingDoc,
  ApiFindAllCourseBookingsDoc,
  ApiFindOneCourseBookingDoc,
  ApiUpdateCourseBookingByMenteeDoc,
  ApiUpdateCourseBookingDoc,
  ApiRemoveCourseBookingDoc,
} from './swagger/course-booking.swagger';

@ApiTags('course-bookings')
@Controller('course-bookings')
export class CourseBookingController {
  constructor(private readonly courseBookingService: CourseBookingService) {}

  @Post()
  @ApiCreateCourseBookingDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  create(
    @Body() payload: CreateCourseBookingInput,
    @User('id') menteeId: string,
  ) {
    return this.courseBookingService.create(payload, menteeId);
  }

  @Get()
  @ApiFindAllCourseBookingsDoc()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() query: FindCourseBookingsQuery,
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.courseBookingService.findAll(query, userId, userRole);
  }

  @Get('check-conflict')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra trùng lịch học (MENTEE)' })
  @ApiQuery({ name: 'meetingTime', required: true, type: String, example: '2026-06-01T09:00:00.000Z' })
  @ApiQuery({ name: 'courseId', required: true, type: String, example: 'course-uuid' })
  @ApiResponse({ status: 200, description: 'Kiểm tra trùng lịch thành công' })
  @UseGuards(JwtAuthGuard)
  async checkConflict(
    @Query('meetingTime') meetingTime: string,
    @Query('courseId') courseId: string,
    @User('id') menteeId: string,
  ) {
    if (!meetingTime || !courseId) {
      throw new BadRequestException('meetingTime và courseId là bắt buộc.');
    }
    const parsedDate = new Date(meetingTime);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('meetingTime không đúng định dạng.');
    }
    return this.courseBookingService.checkConflict(parsedDate, courseId, menteeId);
  }

  @Get(':id')
  @ApiFindOneCourseBookingDoc()
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.courseBookingService.findOne(id, userId, userRole);
  }

  // MENTEE tự cập nhật booking của mình (notes / huỷ)
  @Patch(':id/me')
  @ApiUpdateCourseBookingByMenteeDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  updateByMentee(
    @Param('id') id: string,
    @Body() payload: UpdateCourseBookingByMenteeInput,
    @User('id') menteeId: string,
  ) {
    return this.courseBookingService.updateByMentee(id, payload, menteeId);
  }

  // MENTOR / ADMIN cập nhật đầy đủ (status, meet link, lịch...)
  @Patch(':id')
  @ApiUpdateCourseBookingDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateCourseBookingInput,
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.courseBookingService.update(id, payload, userId, userRole);
  }

  @Delete(':id')
  @ApiRemoveCourseBookingDoc()
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.courseBookingService.remove(id, userId, userRole);
  }
}
