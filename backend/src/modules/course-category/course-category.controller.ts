import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseCategoryService } from './services/course-category.service';
import {
  CreateCourseCategoryInput,
  UpdateCourseCategoryInput,
} from './types/course-category.types';

@Controller('course-categories')
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  @Post()
  create(@Body() payload: CreateCourseCategoryInput) {
    return this.courseCategoryService.create(payload);
  }

  @Get()
  findAll() {
    return this.courseCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseCategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCourseCategoryInput) {
    return this.courseCategoryService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseCategoryService.remove(id);
  }
}
