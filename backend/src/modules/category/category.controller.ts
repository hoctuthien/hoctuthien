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
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './services/category.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  FindCategoriesQuery,
} from './types/category.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiCreateCategoryDoc,
  ApiFindAllCategoriesDoc,
  ApiFindOneCategoryDoc,
  ApiUpdateCategoryDoc,
  ApiRemoveCategoryDoc,
} from './swagger/category.swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiCreateCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  create(@Body() payload: CreateCategoryInput) {
    return this.categoryService.create(payload);
  }

  @Get()
  @ApiFindAllCategoriesDoc()
  @Public()
  findAll(@Query() query: FindCategoriesQuery) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiFindOneCategoryDoc()
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() payload: UpdateCategoryInput) {
    return this.categoryService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
