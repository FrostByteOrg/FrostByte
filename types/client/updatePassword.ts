import { object, TypeOf, z, string } from 'zod';

export const createUpdatePasswordSchema = object({
  password: string({
    required_error: 'Password is required',
  }).min(6, 'Password must be at least 6 characters'),
  passwordConfirmation: z
    .string()
    .min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export type CreateUpdatePasswordInput = TypeOf<typeof createUpdatePasswordSchema>;
