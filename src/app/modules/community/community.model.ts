import { Schema, model } from 'mongoose';
import { ICommunity, CommunityModel } from './community.interface';

const communitySchema = new Schema<ICommunity, CommunityModel>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["published", "reported", "removed"],
    default: "published"
  }
},
  { timestamps: true });

export const Community = model<ICommunity, CommunityModel>('Community', communitySchema);
