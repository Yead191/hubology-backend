import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { NotificationServices } from './notification.service';

const getAllNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationServices.getAllNotifications(req.query);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notifications retrieved successfully!',
        data: result.notifications,
        pagination: result.pagination
    });
});

const createNotification = catchAsync(async (req: Request, res: Response) => {
    const data = { ...req.body };
    const result = await NotificationServices.createNotification(data);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification created successfully!',
        data: result
    });
});

const getSingleNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await NotificationServices.getSingleNotification(id);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification retrieved successfully',
        data: result
    });
});

const updateNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = { ...req.body };
    const result = await NotificationServices.updateNotification(id, payload);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification updated successfully',
        data: result
    });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await NotificationServices.deleteNotification(id);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Notification deleted successfully!",
        data: result
    });
});

export const NotificationController = {
    getAllNotifications,
    createNotification,
    getSingleNotification,
    updateNotification,
    deleteNotification
};
