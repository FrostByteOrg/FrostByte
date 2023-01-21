import { object, TypeOf, z } from 'zod';

export const createSessionSchema = object({
  email: z.string().min(1, { message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type CreateSessionInput = TypeOf<typeof createSessionSchema>;
