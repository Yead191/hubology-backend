import { Model, Types } from 'mongoose';

export type ILike = {
  post: Types.ObjectId,
  user: Types.ObjectId
};


export type LikeModel = Model<ILike> & {
  isLikeByMe: (userId: Types.ObjectId, postId: Types.ObjectId) => Promise<boolean>;
};
