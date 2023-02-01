import { object, TypeOf, z } from 'zod';

export const createPasswordRecoverySchema = object({
  email: z.string().min(1, { message: 'Email is required' }),
});

export type CreatePasswordInputRecovery = TypeOf<typeof createPasswordRecoverySchema>;
