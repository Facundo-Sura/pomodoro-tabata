import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().max(100).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().max(100).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  completed: z.boolean().optional(),
});

export const listTasksSchema = z.object({
  completed: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
