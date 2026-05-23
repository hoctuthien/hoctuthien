import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupCategoryController } from './group-category.controller';
import { GroupCategoryService } from './services/group-category.service';
import { GroupCategoryEntity } from './entities/group-category.entity';
import { GroupCategoryRepository } from './repositories/group-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GroupCategoryEntity])],
  controllers: [GroupCategoryController],
  providers: [GroupCategoryService, GroupCategoryRepository],
  exports: [GroupCategoryService, GroupCategoryRepository, TypeOrmModule],
})
export class GroupCategoryModule {}
