import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './services/category.service';
import { CategoryEntity } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver } from './resolvers/category.resolver';
import { GroupCategoryModule } from '../group-category/group-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    forwardRef(() => GroupCategoryModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, CategoryResolver],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
