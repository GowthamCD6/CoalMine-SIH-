import { z } from 'zod';

export const listMaterialsSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['created_at', 'quantity', 'material_name', 'consignment_number', 'inspection_status']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    organization_id: z.coerce.number().optional(),
    mine_id: z.coerce.number().optional(),
    category: z.enum([
      'ALL',
      'EXPLOSIVES',
      'FUEL_LUBRICANTS',
      'HEAVY_SPARES',
      'CONVEYOR_BELTING',
      'STRUCTURAL_SUPPORT',
      'SAFETY_PPE',
      'CHEMICALS_REAGENTS',
      'ELECTRICAL'
    ]).optional(),
    status: z.enum(['ALL', 'PASSED', 'PENDING', 'CONDITIONAL', 'REJECTED']).optional(),
    search: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }),
};

export const getMaterialSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createMaterialSchema = {
  body: z.object({
    organization_id: z.coerce.number().positive().optional(),
    mine_id: z.coerce.number().positive().optional(),
    material_name: z.string().min(2).max(150),
    category: z.enum([
      'EXPLOSIVES',
      'FUEL_LUBRICANTS',
      'HEAVY_SPARES',
      'CONVEYOR_BELTING',
      'STRUCTURAL_SUPPORT',
      'SAFETY_PPE',
      'CHEMICALS_REAGENTS',
      'ELECTRICAL'
    ]),
    quantity: z.coerce.number().positive(),
    unit: z.enum(['TONS', 'LITERS', 'UNITS', 'METERS', 'DRUMS', 'BOXES']),
    challan_number: z.string().min(2).max(100),
    purchase_order_number: z.string().max(100).optional().nullable(),
    supplier_name: z.string().min(2).max(150),
    transporter_name: z.string().max(150).optional().nullable(),
    vehicle_number: z.string().min(3).max(50),
    driver_name: z.string().max(100).optional().nullable(),
    driver_phone: z.string().max(20).optional().nullable(),
    entry_gate: z.string().min(2).max(100),
    gross_weight_tons: z.coerce.number().min(0).optional().nullable(),
    tare_weight_tons: z.coerce.number().min(0).optional().nullable(),
    net_weight_tons: z.coerce.number().min(0).optional().nullable(),
    inspection_status: z.enum(['PASSED', 'PENDING', 'CONDITIONAL', 'REJECTED']).optional().default('PASSED'),
    inspected_by: z.string().max(100).optional().nullable(),
    remarks: z.string().max(1000).optional().nullable(),
  }),
};

export const updateMaterialStatusSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    inspection_status: z.enum(['PASSED', 'PENDING', 'CONDITIONAL', 'REJECTED']),
    inspected_by: z.string().min(2).max(100),
    remarks: z.string().max(1000).optional().nullable(),
  }),
};
