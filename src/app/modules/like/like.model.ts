import { Schema, model } from 'mongoose';
import { ILike, LikeModel } from './like.interface'; 

const likeSchema = new Schema<ILike, LikeModel>({
  // Define schema fields here
});

export const Like = model<ILike, LikeModel>('Like', likeSchema);
