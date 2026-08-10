import { z } from 'zod';
import { COMMUNITY_CATEGORY } from './community.constants';

const createCommunity = z.object({
  body: z.object({
    category: z.enum([...COMMUNITY_CATEGORY] as [string, ...string[]], {
      required_error: 'Category is required',
    }),
    content: z.string({ required_error: 'Content is required' }),
  }),
});

const updateCommunity = z.object({
  body: z
    .object({
      category: z
        .enum([...COMMUNITY_CATEGORY] as [string, ...string[]])
        .optional(),
      content: z.string().optional(),
    })
    .strict(),
});

export const CommunityValidations = {
  createCommunity,
  updateCommunity,
};

