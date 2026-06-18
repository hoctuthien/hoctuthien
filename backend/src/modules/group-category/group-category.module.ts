import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupCategoryController } from './group-category.controller';
import { GroupCategoryService } from './services/group-category.service';
import { GroupCategoryEntity } from './entities/group-category.entity';
import { GroupCategoryRepository } from './repositories/group-category.repository';
import { GroupCategoryResolver } from './resolvers/group-category.resolver';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupCategoryEntity]),
    forwardRef(() => CategoryModule),
  ],
  controllers: [GroupCategoryController],
  providers: [
    GroupCategoryService,
    GroupCategoryRepository,
    GroupCategoryResolver,
  ],
  exports: [GroupCategoryService, GroupCategoryRepository, TypeOrmModule],
})
export class GroupCategoryModule {}
