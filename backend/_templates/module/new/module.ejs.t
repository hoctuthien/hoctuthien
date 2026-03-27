---
to: src/modules/<%= name %>/<%= name %>.module.ts
---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= className %>Controller } from './<%= name %>.controller';
import { <%= className %>Service } from './services/<%= name %>.service';
import { <%= className %>Entity } from './entities/<%= name %>.entity';

@Module({
  imports: [TypeOrmModule.forFeature([<%= className %>Entity])],
  controllers: [<%= className %>Controller],
  providers: [<%= className %>Service],
  exports: [<%= className %>Service],
})
export class <%= className %>Module {}
