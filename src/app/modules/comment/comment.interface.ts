import { Model, Types } from 'mongoose';

export type IComment = {
  // Define the interface for Comment here
  post: Types.ObjectId
  author: Types.ObjectId
  text: string
};

export type CommentModel = Model<IComment>;
