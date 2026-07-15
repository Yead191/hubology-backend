import { JwtPayload } from 'jsonwebtoken';
import { ICommunity } from './community.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import { Community } from './community.model';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { Like } from '../like/like.model';

const createPostToDB = async (user: JwtPayload, payload: ICommunity) => {
    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!")
    }
    if (payload.image) {
        unlinkFile(payload.image)
    }
    const result = await Community.create({ ...payload, author: user.id, status: "published" });
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Something went wrong!");
    }
    return result
}

const getAllPostsFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    console.log(user)
    let postsQuery

    if (user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN) {
        postsQuery = new QueryBuilder(Community.find(), query).search(['title', 'category']).filter().sort().paginate().fields().populate(["author"], {
            author: "name email image"
        })
    }
    else {
        postsQuery = new QueryBuilder(Community.find({ status: { $nin: "removed" } }), query).search(['title', 'category',]).filter().sort().paginate().fields().populate(["author"], {
            author: "name email image"
        })
    }

    let [posts, pagination] = await Promise.all([
        postsQuery.modelQuery.lean(),
        postsQuery.getPaginationInfo()
    ])

    posts = await Promise.all(posts.map(async post => {
        const isLiked = await Like.isLikeByMe(user.id as any, post._id as any)
        return {
            ...post,
            isLiked
        }
    }))
    return { posts, pagination }
}

const getSinglePostFromDB = async (id: string, user: JwtPayload) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
    }
    const isPostExist = await Community.findById(id).populate("author", "name email image").lean()
    if (!isPostExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Post doesn't exist!")
    }
    const isLikeByMe = await Like.isLikeByMe(user.id as any, id as any)

    return {
        ...isPostExist, isLikeByMe
    }
}

const updatePostToDB = async (user: JwtPayload, payload: ICommunity, postId: string) => {

    const isPostExist = await Community.findById(postId)
    if (!isPostExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Post doesn't exist!")
    }
    if (isPostExist.author.toString() !== user.id.toString()) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to update this post!")
    }
    if (isPostExist.status === "removed") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This Post is removed by admin and cannot be updated!")
    }
    const result = await Community.findByIdAndUpdate(postId, payload, { new: true })
    return result

}

const deletePostFromDB = async (user: JwtPayload, id: string) => {
    const isPostExist = await Community.findById(id)
    if (!isPostExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Post doesn't exist!")
    }
    if (isPostExist.author.toString() !== user.id.toString()) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to delete this post!")
    }
    if (isPostExist.status === "removed") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This Post is already removed by admin and will track on admin panel!")
    }
    const result = await Community.deleteOne({ _id: id })
    return result
}


// get my post
const getMyPosts = async (user: JwtPayload, query: Record<string, any>) => {
    if (!user || !user.id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!")
    }
    const myPostsQuery = new QueryBuilder(Community.find({ author: user.id }), query).search(['title', 'category']).filter().sort().paginate().fields().populate(["author"], {
        author: "name email image"
    })

    const [myPosts, pagination] = await Promise.all([
        myPostsQuery.modelQuery.lean(),
        myPostsQuery.getPaginationInfo()
    ])
    return { myPosts, pagination }

}

export const CommunityServices = {
    createPostToDB,
    getAllPostsFromDB,
    updatePostToDB,
    deletePostFromDB,
    getSinglePostFromDB,
    getMyPosts
};
