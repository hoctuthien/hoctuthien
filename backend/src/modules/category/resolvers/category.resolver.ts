import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { CategoryService } from '../services/category.service';
import { CategoryGql } from '../types/category.graphql';
import { GroupCategoryGql } from '../../group-category/types/group-category.graphql';
import { Public } from '../../../common/decorators/public.decorator';
import { GroupCategoryRepository } from '../../group-category/repositories/group-category.repository';

@Resolver(() => CategoryGql)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly groupCategoryRepository: GroupCategoryRepository,
  ) {}

  @Query(() => [CategoryGql], { name: 'categories' })
  @Public()
  async getCategories() {
    const result = await this.categoryService.findAll({ page: 1, limit: 100 });
    return result.data;
  }

  @Query(() => CategoryGql, { name: 'category' })
  @Public()
  async getCategory(
    @Args('id', { type: () => String, nullable: true }) id?: string,
    @Args('slug', { type: () => String, nullable: true }) slug?: string,
  ) {
    return this.categoryService.findOne(id, slug);
  }

  @ResolveField('groupCategory', () => GroupCategoryGql, { nullable: true })
  async getGroupCategory(@Parent() category: any) {
    if (!category.groupCategoryId) return null;
    return this.groupCategoryRepository.findById(category.groupCategoryId);
  }
}
