import { z } from 'zod';


const createCommunity = z.object({
    body: z.object({
        category: z.string({ required_error: "Category is required" }),
        content: z.string({ required_error: "Content is required" }),
    })
})


const updateCommunity = z.object({
    body: z.object({
        category: z.string().optional(),
        content: z.string().optional(),
    }).strict()
})

export const CommunityValidations = {
    createCommunity,
    updateCommunity
};
