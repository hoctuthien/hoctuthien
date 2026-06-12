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
import { GroupCategoryService } from './services/group-category.service';
import {
  CreateGroupCategoryInput,
  UpdateGroupCategoryInput,
  FindGroupCategoriesQuery,
} from './types/group-category.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiCreateGroupCategoryDoc,
  ApiFindAllGroupCategoriesDoc,
  ApiFindOneGroupCategoryDoc,
  ApiUpdateGroupCategoryDoc,
  ApiRemoveGroupCategoryDoc,
} from './swagger/group-category.swagger';

@ApiTags('group-categories')
@Controller('group-categories')
export class GroupCategoryController {
  constructor(private readonly groupCategoryService: GroupCategoryService) {}

  @Post()
  @ApiCreateGroupCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() payload: CreateGroupCategoryInput) {
    return this.groupCategoryService.create(payload);
  }

  @Get()
  @ApiFindAllGroupCategoriesDoc()
  @Public()
  findAll(@Query() query: FindGroupCategoriesQuery) {
    return this.groupCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiFindOneGroupCategoryDoc()
  @Public()
  findOne(@Param('id') id: string) {
    return this.groupCategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateGroupCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() payload: UpdateGroupCategoryInput) {
    return this.groupCategoryService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveGroupCategoryDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.groupCategoryService.remove(id);
  }
}
