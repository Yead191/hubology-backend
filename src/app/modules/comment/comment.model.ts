import { Schema, model } from 'mongoose';
import { IComment, CommentModel } from './comment.interface';

const commentSchema = new Schema<IComment, CommentModel>({
  // Define schema fields here
  post: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
},
  { timestamps: true }
);

commentSchema.index({
  post: 1,
  createdAt: -1,
})

export const Comment = model<IComment, CommentModel>('Comment', commentSchema);
