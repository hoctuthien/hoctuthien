import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './services/course.service';
import { CourseEntity } from './entities/course.entity';
import { CourseRepository } from './repositories/course.repository';
import { CourseCategoryEntity } from '../course-category/entities/course-category.entity';
import { CourseResolver } from './resolvers/course.resolver';
import { CourseCategoryModule } from '../course-category/course-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, CourseCategoryEntity]),
    CourseCategoryModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository, CourseResolver],
  exports: [CourseService, CourseRepository],
})
export class CourseModule {}

