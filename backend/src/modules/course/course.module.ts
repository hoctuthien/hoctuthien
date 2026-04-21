import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './services/course.service';
import { CourseEntity } from './entities/course.entity';
import { CourseRepository } from './repositories/course.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity])],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService, CourseRepository],
})
export class CourseModule {}
