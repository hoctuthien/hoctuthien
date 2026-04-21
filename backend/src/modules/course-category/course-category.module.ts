import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategoryController } from './course-category.controller';
import { CourseCategoryService } from './services/course-category.service';
import { CourseCategoryEntity } from './entities/course-category.entity';
import { CourseCategoryRepository } from './repositories/course-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategoryEntity])],
  controllers: [CourseCategoryController],
  providers: [CourseCategoryService, CourseCategoryRepository],
  exports: [CourseCategoryService, CourseCategoryRepository],
})
export class CourseCategoryModule {}
