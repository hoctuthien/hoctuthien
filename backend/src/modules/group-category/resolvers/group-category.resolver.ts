import {
  Resolver,
  Query,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GroupCategoryService } from '../services/group-category.service';
import { GroupCategoryGql } from '../types/group-category.graphql';
import { CategoryGql } from '../../category/types/category.graphql';
import { Public } from '../../../common/decorators/public.decorator';
import { CategoryRepository } from '../../category/repositories/category.repository';

@Resolver(() => GroupCategoryGql)
export class GroupCategoryResolver {
  constructor(
    private readonly groupCategoryService: GroupCategoryService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @Query(() => [GroupCategoryGql], { name: 'groupCategories' })
  @Public()
  async getGroupCategories() {
    const result = await this.groupCategoryService.findAll({
      page: 1,
      limit: 100,
    });
    return result.data;
  }

  @Query(() => GroupCategoryGql, { name: 'groupCategory' })
  @Public()
  async getGroupCategory(@Args('id', { type: () => ID }) id: string) {
    return this.groupCategoryService.findOne(id);
  }

  @ResolveField('categories', () => [CategoryGql], { nullable: 'itemsAndList' })
  async getCategories(@Parent() groupCategory: GroupCategoryGql) {
    return this.categoryRepository.findMany({
      where: { groupCategoryId: groupCategory.id },
    });
  }
}
