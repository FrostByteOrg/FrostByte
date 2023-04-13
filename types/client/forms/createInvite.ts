import { object, TypeOf, z } from 'zod';

export const createInviteFormInputSchema = object({
  numUses: z.number(),
  expiresAt: z.enum(['1 week', '1 day', '1 hour', '30 minutes', 'null']),
});

export type CreateInviteFormInput = TypeOf<typeof createInviteFormInputSchema>;
