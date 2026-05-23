import { z } from 'zod';
import {
  groupCategorySchema,
  createGroupCategorySchema,
  updateGroupCategorySchema,
  findGroupCategoriesQuerySchema,
} from '../schema/group-category.schema';

export type GroupCategory = z.infer<typeof groupCategorySchema>;
export type CreateGroupCategoryInput = z.infer<typeof createGroupCategorySchema>;
export type UpdateGroupCategoryInput = z.infer<typeof updateGroupCategorySchema>;
export type FindGroupCategoriesQuery = z.infer<typeof findGroupCategoriesQuerySchema>;
