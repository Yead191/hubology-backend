import { Request, Response, NextFunction } from 'express';
import { EventServices } from './event.service';
import catchAsync from '../../../shared/catchAsync';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const coverImage = getSingleFilePath(req.files, 'coverImage');
  const images = getMultipleFilesPath(req.files, 'images');

  data.coverImage = coverImage;
  data.images = images?.map((url: string) => url);

  const result = await EventServices.createEventToDB(data);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event created successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getAllEvents(req.user, req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Events fetched successfully',
    pagination: result.pagination,
    data: result.events,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventServices.getSingleEvent(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event fetched successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const coverImage = getSingleFilePath(req.files, 'coverImage');
  const images = getMultipleFilesPath(req.files, 'images');

  data.coverImage = coverImage;
  data.images = images?.map((url: string) => url);

  const result = await EventServices.updateEvent(id, data);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventServices.deleteEvent(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
