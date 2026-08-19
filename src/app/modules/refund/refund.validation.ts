import { z } from 'zod';

const createRefundZodSchema = z.object({
  body: z.object({
    // order: z.string({ required_error: 'Order is required' }),
    reason: z.string({ required_error: 'Reason is required' }),
    images: z
      .array(z.string({ required_error: 'Image is required' }))
      .optional(),
  }),
});

const reviewRefundZodSchema = z.object({
  body: z.object({
    status: z.enum(['refunded', 'rejected'], {
      required_error: 'Status is required (refunded or rejected)',
    }),
    refundType: z.enum(['full', 'partial']).optional(),
    refundAmount: z.number().optional(),
    adminNote: z.string().optional(),
  }),
});

export const RefundValidations = {
  createRefundZodSchema,
  reviewRefundZodSchema,
};
