import { object, TypeOf, z } from 'zod';

export const createServerSchema = object({
  name: z
    .string({ required_error: 'Server name is required' })
    .min(3, { message: 'Must be at least 3 characters' }),
  description: z.string().optional().nullable(),
});

export type CreateServerInput = TypeOf<typeof createServerSchema>;
