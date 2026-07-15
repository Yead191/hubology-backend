import { Schema, Types, model } from 'mongoose';
import { ILike, LikeModel } from './like.interface';

const likeSchema = new Schema<ILike, LikeModel>({
  post: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
},
  { timestamps: true }
);


// prevent duplicate like
likeSchema.index({
  post: 1,
  user: 1
}, { unique: true })


likeSchema.statics.isLikeByMe = async function (userId: Types.ObjectId, postId: Types.ObjectId) {
  const isLiked = await this.exists({ user: userId, post: postId })
  return !!isLiked
}

export const Like = model<ILike, LikeModel>('Like', likeSchema);
