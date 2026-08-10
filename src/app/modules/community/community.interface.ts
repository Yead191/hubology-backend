import { Model, Types } from 'mongoose';
import { COMMUNITY_CATEGORY } from './community.constants';

export type CommunityCategory = (typeof COMMUNITY_CATEGORY)[number];

export type ICommunity = {
  // Define the interface for Community here
  author: Types.ObjectId;
  category: CommunityCategory;
  content: string;
  image?: string;
  totalLikes: number;
  totalComments: number;
  reportCount: number;
  status?: string;
  isLikeByMe?: boolean;
};

export type CommunityModel = Model<ICommunity>;
