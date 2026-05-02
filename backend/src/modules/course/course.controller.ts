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
import { CourseService } from './services/course.service';
import { CreateCourseInput, UpdateCourseInput } from './types/course.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCourseDoc,
  ApiFindAllCoursesDoc,
  ApiFindOneCourseDoc,
  ApiRemoveCourseDoc,
  ApiUpdateCourseDoc,
} from './swagger/course.swagger';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiCreateCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  create(
    @Body() payload: CreateCourseInput,
    @User('id') mentorId: string,
  ) {
    return this.courseService.create(payload, mentorId);
  }

  @Get()
  @ApiFindAllCoursesDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiFindOneCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  update(@Param('id') id: string, @Body() payload: UpdateCourseInput) {
    return this.courseService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveCourseDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
