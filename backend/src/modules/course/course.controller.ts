import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
  Req,
} from '@nestjs/common';
import { AppLogger } from '../../common/logger/app-logger.service';
import { CourseService } from './services/course.service';
import {
  CreateCourseInput,
  UpdateCourseInput,
  ApproveCourseInput,
  FindCoursesQuery,
} from './types/course.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiApproveCourseDoc,
  ApiCreateCourseDoc,
  ApiFindAllCoursesDoc,
  ApiFindOneCourseDoc,
  // ApiFindAllCoursesDoc,
  // ApiFindOneCourseDoc,
  ApiRemoveCourseDoc,
  ApiUpdateCourseDoc,
  // ApiApproveCourseDoc,
} from './swagger/course.swagger';
import { createCourseSchema, updateCourseSchema } from './schema/course.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CourseController.name);
  }

  @Post()
  @ApiCreateCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @UsePipes(new ZodValidationPipe(createCourseSchema))
  async create(
    @Body() payload: CreateCourseInput,
    @User('id') mentorId: string,
  ) {
    this.logger.log({ mentorId, title: payload.title }, 'Creating course');
    return await this.courseService.create(payload, mentorId);
  }

  @Get()
  @ApiFindAllCoursesDoc()
  @Public()
  findAll(@Query() query: FindCoursesQuery, @Req() req: any) {
    this.logger.log({ query }, 'Finding all courses');
    let userRole: string | undefined = undefined;
    let userId: string | undefined = undefined;
    const authHeader = req.headers?.authorization;
    let token: string | null = null;
    if (req.cookies) {
      token = req.cookies['access_token'];
    }
    if (!token && authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf-8'),
          );
          userRole = payload.role;
          userId = payload.sub || payload.id;
        }
      } catch (e) {
        // ignore decoding errors
      }
    }
    return this.courseService.findAll(query, userRole, userId);
  }

  @Get(':id')
  @ApiFindOneCourseDoc()
  @Public()
  findOne(@Param('id') id: string) {
    this.logger.log({ courseId: id }, 'Finding course by id');
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @UsePipes(new ZodValidationPipe(updateCourseSchema))
  update(
    @Param('id') id: string,
    @Body() payload: UpdateCourseInput,
    @User('id') mentorId: string,
  ) {
    this.logger.log({ courseId: id, mentorId }, 'Updating course');
    return this.courseService.update(id, payload, mentorId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @User('id') mentorId: string,
  ) {
    this.logger.log(
      { courseId: id, mentorId, status },
      'Updating course status',
    );
    return this.courseService.updateStatus(id, mentorId, status);
  }

  @Patch(':id/approve')
  @ApiApproveCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approve(
    @Param('id') id: string,
    @Body() payload: ApproveCourseInput,
    @User('id') adminId: string,
  ) {
    this.logger.log(
      { courseId: id, adminId, status: payload.status },
      'Approving course',
    );
    return this.courseService.approve(id, { ...payload, approvedBy: adminId });
  }

  @Delete(':id')
  @ApiRemoveCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  remove(@Param('id') id: string, @User('id') mentorId: string) {
    this.logger.log({ courseId: id, mentorId }, 'Removing course');
    return this.courseService.remove(id, mentorId);
  }
}
