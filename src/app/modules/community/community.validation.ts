import { z } from 'zod';


const createCommunity = z.object({
    body: z.object({
        category: z.string({ required_error: "Category is required" }),
        content: z.string({ required_error: "Content is required" }),
    })
})

export const CommunityValidations = {
    createCommunity
};
