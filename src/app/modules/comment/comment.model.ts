import { Schema, model } from 'mongoose';
import { IComment, CommentModel } from './comment.interface'; 

const commentSchema = new Schema<IComment, CommentModel>({
  // Define schema fields here
});

export const Comment = model<IComment, CommentModel>('Comment', commentSchema);
