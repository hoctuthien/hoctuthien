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
} from '@nestjs/common';
import { CourseService } from './services/course.service';
import {
  CreateCourseInput,
  UpdateCourseInput,
  ApproveCourseInput,
} from './types/course.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCourseDoc,
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
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiCreateCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @UsePipes(new ZodValidationPipe(createCourseSchema))
  async create(
    @Body() payload: CreateCourseInput,
    @User('id') mentorId: string,
  ) {
    return await this.courseService.create(payload, mentorId);
  }

  // @Get()
  // @ApiFindAllCoursesDoc()
  // @UseGuards(JwtAuthGuard)
  // findAll() {
  //   return this.courseService.findAll();
  // }

  // @Get(':id')
  // @ApiFindOneCourseDoc()
  // @UseGuards(JwtAuthGuard)
  // findOne(@Param('id') id: string) {
  //   return this.courseService.findOne(id);
  // }

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
    return this.courseService.updateStatus(id, mentorId, status);
  }

  // @Patch(':id/approve')
  // @ApiApproveCourseDoc()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // approve(
  //   @Param('id') id: string,
  //   @Body() payload: ApproveCourseInput,
  //   @User('id') adminId: string,
  // ) {
  //   return this.courseService.approve(id, { ...payload, approvedBy: adminId });
  // }

  @Delete(':id')
  @ApiRemoveCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  remove(@Param('id') id: string, @User('id') mentorId: string) {
    return this.courseService.remove(id, mentorId);
  }
}
