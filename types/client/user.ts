import { object, TypeOf, z, string } from 'zod';

export const createUserSchema = object({
  username: string({
    required_error: 'Username is required',
  }).min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, { message: 'Email is required' }),
  password: string({
    required_error: 'Password is required',
  }).min(6, 'Password must be at least 3 characters'),
  passwordConfirmation: z
    .string()
    .min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
