import { z } from 'zod';
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  findCategoriesQuerySchema,
} from '../schema/category.schema';

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type FindCategoriesQuery = z.infer<typeof findCategoriesQuerySchema>;
