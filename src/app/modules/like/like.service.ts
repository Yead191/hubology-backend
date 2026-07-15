import { JwtPayload } from 'jsonwebtoken';
import { LikeModel } from './like.interface';
import { Community } from '../community/community.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Like } from './like.model';
import QueryBuilder from '../../builder/QueryBuilder';

const toggleLikeToDB = async (user: JwtPayload, postId: string) => {
    const post = await Community.findById({ _id: postId })
    if (!post) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This post is not found!")
    }
    if (post.status === "removed") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This post is removed by admin!")
    }
    const existingLike = await Like.findOne({
        post: postId,
        user: user.id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
    } else {
        await Like.create({
            post: postId,
            user: user.id,
        });
    }

    const updatedPost = await Community.findByIdAndUpdate(
        postId,
        {
            $inc: {
                totalLikes: existingLike ? -1 : 1,
            },
        },
        {
            new: true,
            select: 'totalLikes',
        }
    );

    return {
        liked: !existingLike,
        totalLikes: updatedPost?.totalLikes,
    };
}



const getAllLikeFromDB = async (query: Record<string, any>, id: string) => {
    const qb = new QueryBuilder(Like.find({ post: id }), query).sort().populate(["user"], {
        user: "name email"
    })
    const [result, meta] = await Promise.all([
        qb.modelQuery.lean(),
        qb.getPaginationInfo()
    ])
    return { result, meta }
}



const getMyLikeFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    const qb = new QueryBuilder(
        Like.find({ user: user.id })
            .populate('user', 'name email profile')
            .populate({
                path: 'post',
                select: 'category content author totalLikes totalComments',
                populate: {
                    path: 'author',
                    select: 'name email profile',
                },
            }),
        query
    ).sort()


    const [result, meta] = await Promise.all([
        qb.modelQuery.lean(),
        qb.getPaginationInfo()
    ])
    return { result, meta }
}


export const LikeServices = { toggleLikeToDB, getMyLikeFromDB, getAllLikeFromDB };
