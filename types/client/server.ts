import { object, TypeOf, z } from 'zod';

export const createServerSchema = object({
  name: z.string().min(3, { message: 'Server name is required' }),
});

export type CreateServerInput = TypeOf<typeof createServerSchema>;
