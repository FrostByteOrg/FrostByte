import { object, TypeOf, z } from 'zod';

export const createChannelSchema = object({
  name: z
    .string({ required_error: 'Channel name is required' })
    .min(3, { message: 'Must be at least 3 characters' })
    .trim(),
  description: z.string().optional(),
  isMedia: z.boolean().optional(),
});

export type CreateChannelInput = TypeOf<typeof createChannelSchema>;
