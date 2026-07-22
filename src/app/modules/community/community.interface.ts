import { Model, Types } from 'mongoose';

export type ICommunity = {
  // Define the interface for Community here
  author: Types.ObjectId
  category: string
  content: string
  image?: string
  totalLikes: number;
  totalComments: number;
  reportCount: number;
  status?: string
};

export type CommunityModel = Model<ICommunity>;
