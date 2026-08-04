import { z } from 'zod';

const createBookingZod = z.object({
  body: z.object({
    service: z.string({ required_error: 'Service is required' }),
    note: z.string().optional(),
    phone: z.string({ required_error: 'Phone is required' }),
    preferredDate: z.string({ required_error: 'Preferred date is required' }),
    preferredTime: z.string({ required_error: 'Preferred time is required' }),
  }),
});

export const BookingsValidations = {
  createBookingZod,
};
