import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupCategoryGql } from '../../group-category/types/group-category.graphql';

@ObjectType()
export class CategoryGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field()
  status: string;

  @Field(() => GroupCategoryGql, { nullable: true })
  groupCategory?: GroupCategoryGql;
}
