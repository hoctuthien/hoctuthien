import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { CourseService } from '../services/course.service';
import { CourseGql } from '../types/course.graphql';
import { CategoryGql } from '../../category/types/category.graphql';
import { Public } from '../../../common/decorators/public.decorator';
import { CourseCategoryRepository } from '../../course-category/repositories/course-category.repository';

@Resolver(() => CourseGql)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseCategoryRepository: CourseCategoryRepository,
  ) {}

  @Query(() => [CourseGql], { name: 'courses' })
  @Public()
  async getCourses(
    @Args('groupCategoryId', { type: () => String, nullable: true }) groupCategoryId?: string,
    @Args('groupCategorySlug', { type: () => String, nullable: true }) groupCategorySlug?: string,
    @Args('categoryId', { type: () => String, nullable: true }) categoryId?: string,
    @Args('categorySlug', { type: () => String, nullable: true }) categorySlug?: string,
  ) {
    const result = await this.courseService.findAll({
      page: 1,
      limit: 100,
      groupCategoryId,
      groupCategorySlug,
      categoryId,
      categorySlug,
    });
    return result.items;
  }

  @Query(() => CourseGql, { name: 'course' })
  @Public()
  async getCourse(@Args('id', { type: () => ID }) id: string) {
    return this.courseService.findOne(id);
  }

  @ResolveField('categories', () => [CategoryGql], { nullable: 'itemsAndList' })
  async getCategories(@Parent() course: any) {
    const courseCategories = await this.courseCategoryRepository.findMany({
      where: { courseId: course.id },
      relations: ['category'],
    });
    return courseCategories.map((cc) => cc.category);
  }
}
