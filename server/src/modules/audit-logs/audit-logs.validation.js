import { z } from 'zod';

export const listAuditLogsSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'created_at', 'action', 'entity_type']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    user_id: z.coerce.number().optional(),
    organization_id: z.coerce.number().optional(),
    mine_id: z.coerce.number().optional(),
    action: z.string().optional(),
    entity_type: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

export const getAuditLogSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};
