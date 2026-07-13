import { z } from 'zod';

const createServicesZodSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required',
        }),
        tagline: z.string({
            required_error: 'Tagline is required',
        }),
        price: z.string().refine(val => {
            const parseData = priceZodValidation.parse(JSON.parse(val))
            return !!parseData
        }),
        features: z.array(z.string()).nonempty({
            message: 'At least one feature is required.',
        }),
        featured: z.coerce.boolean(),
        longDescription: z.string({
            required_error: 'Long description is required',
        }),

    }),
});

const updateServicesZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        tagline: z.string().optional(),
        price: z.string().refine(val => {
            const parseData = priceZodValidation.parse(JSON.parse(val))
            return !!parseData
        }).optional(),
        features: z.array(z.string()).nonempty({
            message: 'At least one feature is required.',
        }).optional(),
        featured: z.coerce.boolean().optional(),
        longDescription: z.string().optional(),
    }),
});


const priceZodValidation = z.object(
    {
        amount: z.number({
            required_error: 'Price amount is required',
        }),
        frequency: z.string({
            required_error: 'Price frequency is required',
        }),
    },
    {
        required_error: 'Price is required',
    }
)

export const ServicesValidations = {
    createServicesZodSchema,
    updateServicesZodSchema,
};
