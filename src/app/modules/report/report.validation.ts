import { z } from 'zod';

const createReport = z.object({
    body: z.object({
        post: z.string({
            required_error: "Post is required"
        }),
        reason: z.string({
            required_error: "Reason is required"
        }),
        description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    })
})

const reviewReportZodSchema = z.object({
    body: z.object({

        status: z.enum(['accepted', 'rejected'], {
            required_error: "Status is required"
        }),
    })
})

export const ReportValidations = {
    createReport,
    reviewReportZodSchema
};
