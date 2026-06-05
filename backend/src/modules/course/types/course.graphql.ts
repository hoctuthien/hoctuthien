import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { CategoryGql } from '../../category/types/category.graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class CourseGql {
  @Field(() => ID)
  id: string;

  @Field()
  mentorId: string;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  durationMinutes: number;

  @Field()
  status: string;

  @Field(() => [CategoryGql], { nullable: 'itemsAndList' })
  categories?: CategoryGql[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  prerequisites?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}

