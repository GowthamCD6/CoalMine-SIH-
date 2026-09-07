import { z } from 'zod';

export const sessionParamSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};
