import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseService } from './services/course.service';
import { CreateCourseInput, UpdateCourseInput } from './types/course.types';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() payload: CreateCourseInput) {
    return this.courseService.create(payload);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCourseInput) {
    return this.courseService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
