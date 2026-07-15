import { Request, Response, NextFunction } from 'express';
import { LikeServices } from './like.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

const toggleLikeToDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const user = req.user as JwtPayload
    const result = await LikeServices.toggleLikeToDB(user, id)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Successfully toggled like',
        data: result,
    });
})

const getAllLike = catchAsync(async (req: Request, res: Response) => {
    const result = await LikeServices.getAllLikeFromDB(req.query, req.params.id)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Successfully fetched all likes',
        pagination: result.meta,
        data: result.result,
    });
})


const getMyLike = catchAsync(async (req: Request, res: Response) => {
    const result = await LikeServices.getMyLikeFromDB(req.user, req.query)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Successfully fetched my likes',
        pagination: result.meta,
        data: result.result,
    });
})


export const LikeController = { toggleLikeToDB, getMyLike, getAllLike };
