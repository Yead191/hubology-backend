import { JwtPayload } from 'jsonwebtoken';
import { CommentModel, IComment } from './comment.interface';
import { Community } from '../community/community.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Comment } from './comment.model';
import QueryBuilder from '../../builder/QueryBuilder';


const createCommentToDB = async (user: JwtPayload, postId: string, payload: IComment) => {
    const post = await Community.findById(postId)
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Post doesn't exist!")
    }
    if (post.status === 'removed') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This post is removed by admin!")
    }
    const comment = {
        text: payload.text,
        post: postId,
        author: user.id
    }
    const result = await Comment.create(comment)
    await Community.findByIdAndUpdate(postId, { $inc: { totalComments: 1 } })
    return result
}

const getPostCommentsFromDB = async (postId: string, query: Record<string, any>) => {
    const post = await Community.findById(postId)
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Post doesn't exist!")
    }

    const commentsQuery = new QueryBuilder(Comment.find({ post: postId }), query)
        .sort()
        .paginate()
        .fields()
        .populate(["author"], {
            author: "name image role"
        })
    const [comments, meta] = await Promise.all([
        commentsQuery.modelQuery.lean(),
        commentsQuery.getPaginationInfo()
    ])
    return { comments, meta }
}

const updateComment = async (commentId: string, user: JwtPayload, payload: { text: String }) => {
    const comment = await Comment.findById(commentId)
    // console.log(comment)
    if (!comment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Comment doesn't exist!")
    }
    if (user.id !== comment.author.toString()) {
        // console.log(user.id, comment.author)
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to update this comment!")
    }
    const result = await Comment.findByIdAndUpdate(commentId, payload, { new: true })
    return result
}

const deleteComment = async (commentId: string, user: JwtPayload) => {
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Comment doesn't exist!")
    }
    if (user.id !== comment.author.toString()) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to delete this comment!")
    }
    const result = await Comment.findByIdAndDelete(commentId)
    await Community.findByIdAndUpdate(comment.post, { $inc: { totalComments: -1 } })
    return result
}


// my commented posts
const myCommentedPostsFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    const postsQuery = new QueryBuilder(Comment.find({ author: user.id }).populate("author", "name role image").populate({
        path: "post",
        select: "category content author totalLikes totalComments",
        populate: {
            path: "author",
            select: "name image role"
        }
    }), query)
        .sort().search(["category", "author.name"]).filter()
    const [posts, pagination] = await Promise.all([
        postsQuery.modelQuery.lean(),
        postsQuery.getPaginationInfo()
    ])

    return {
        posts, pagination
    }
}

export const CommentServices = { createCommentToDB, getPostCommentsFromDB, updateComment, deleteComment, myCommentedPostsFromDB };
