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
import { CourseCategoryService } from './services/course-category.service';
import {
  CreateCourseCategoryInput,
  UpdateCourseCategoryInput,
} from './types/course-category.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCourseCategoryDoc,
  ApiFindAllCourseCategoriesDoc,
  ApiFindOneCourseCategoryDoc,
  ApiRemoveCourseCategoryDoc,
  ApiUpdateCourseCategoryDoc,
} from './swagger/course-category.swagger';

@ApiTags('course-categories')
@Controller('course-categories')
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  @Post()
  @ApiCreateCourseCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() payload: CreateCourseCategoryInput) {
    return this.courseCategoryService.create(payload);
  }

  @Get()
  @ApiFindAllCourseCategoriesDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.courseCategoryService.findAll();
  }

  @Get(':id')
  @ApiFindOneCourseCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.courseCategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateCourseCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() payload: UpdateCourseCategoryInput) {
    return this.courseCategoryService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveCourseCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.courseCategoryService.remove(id);
  }
}
