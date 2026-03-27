---
to: src/modules/<%= name %>/<%= name %>.controller.ts
---
import { Controller, Get, Param } from '@nestjs/common';
import { <%= className %>Service } from './services/<%= name %>.service';

@Controller('<%= route %>')
export class <%= className %>Controller {
  constructor(private readonly <%= name %>Service: <%= className %>Service) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<%= name %>Service.findOne(id);
  }
}
