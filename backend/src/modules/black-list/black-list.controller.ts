import { Controller, Get, Param } from '@nestjs/common';
import { BlackListService } from './services/black-list.service';

@Controller('black-lists')
export class BlackListController {
  constructor(private readonly black-listService: BlackListService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.black-listService.findOne(id);
  }
}
