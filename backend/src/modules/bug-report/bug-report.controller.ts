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
import { ApiTags } from '@nestjs/swagger';
import { BugReportService } from './services/bug-report.service';
import { CreateBugReportInput, UpdateBugReportInput } from './types/bug-report.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiCreateBugReportDoc,
  ApiFindAllBugReportsDoc,
  ApiFindOneBugReportDoc,
  ApiUpdateBugReportDoc,
  ApiRemoveBugReportDoc,
} from './swagger/bug-report.swagger';

@ApiTags('bug-reports')
@Controller('bug-reports')
@UseGuards(JwtAuthGuard)
export class BugReportController {
  constructor(private readonly bugReportService: BugReportService) {}

  @Post()
  @ApiCreateBugReportDoc()
  create(
    @Body() payload: CreateBugReportInput,
    @User('id') userId: string,
  ) {
    return this.bugReportService.create(payload, userId);
  }

  @Get()
  @ApiFindAllBugReportsDoc()
  findAll(
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.bugReportService.findAll(userId, userRole);
  }

  @Get(':id')
  @ApiFindOneBugReportDoc()
  findOne(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') userRole: string,
  ) {
    return this.bugReportService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @ApiUpdateBugReportDoc()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateBugReportInput,
  ) {
    return this.bugReportService.update(id, payload);
  }

  @Delete(':id')
  @ApiRemoveBugReportDoc()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.bugReportService.remove(id);
  }
}
