import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CategoryGql } from '../../category/types/category.graphql';

@ObjectType()
export class GroupCategoryGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  status: string;

  @Field(() => [CategoryGql], { nullable: 'itemsAndList' })
  categories?: CategoryGql[];
}

