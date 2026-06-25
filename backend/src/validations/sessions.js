import { z } from 'zod';

export const createSessionSchema = z.object({
  type: z.enum(['pomodoro', 'tabata'], { required_error: 'Type is required' }),
  duration: z.number().int().positive('Duration must be a positive integer'),
  rounds: z.number().int().positive().optional(),
  taskId: z.string().uuid().optional(),
});

export const listSessionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['pomodoro', 'tabata']).optional(),
});
