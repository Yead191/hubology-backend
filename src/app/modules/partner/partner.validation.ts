import { z } from 'zod';
import { PARTNER_STATUS } from './partner.interface';

const createPartnerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string({}).optional(),
    offers: z
      .array(z.string({ required_error: 'Offer is required' }))
      .min(1, 'At least one offer is required')
      .default([]),
    website: z.string({}).optional(),
    contactEmail: z.string({}).optional(),
    contactPhone: z.string({}).optional(),
  }),
});

const updatePartnerZodSchema = z.object({
  body: z.object({
    name: z.string({}).optional(),
    description: z.string({}).optional(),
    offers: z.array(z.string()).default([]).optional(),
    website: z.string({}).optional(),
    contactEmail: z.string({}).optional(),
    contactPhone: z.string({}).optional(),
    status: z.nativeEnum(PARTNER_STATUS).optional(),
    featured: z.boolean({}).optional(),
  }),
});

const changeStatusZodValidation = z.object({
  body: z.object({
    id: z.string({ required_error: 'Id is required' }),
    status: z.nativeEnum(PARTNER_STATUS, {
      required_error: 'Status is required',
    }),
  }),
});

export const PartnerValidations = {
  createPartnerZodSchema,
  updatePartnerZodSchema,
  changeStatusZodValidation,
};
