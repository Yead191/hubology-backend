import { Request, Response, NextFunction } from 'express';
import { CommunityServices } from './community.service';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createPost = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    let data = { ...req.body }
    const image = getSingleFilePath(req.files, "image")
    if (image) {
        data.image = image
    }
    const result = await CommunityServices.createPostToDB(user, data)
    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Post created successfully",
        data: result
    })
})


const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    console.log(user)
    const result = await CommunityServices.getAllPostsFromDB(user, req.query)
    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Posts fetched successfully",
        data: result
    })
})

const updatePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    const data = req.body

    const result = await CommunityServices.updatePostToDB(user, data, id)
    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Post updated successfully",
        data: result
    })
})

const deletePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user
    const result = await CommunityServices.deletePostFromDB(user, id)
    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Post deleted successfully",
        data: result
    })
})

export const CommunityController = { createPost, getAllPosts, updatePost, deletePost };
