import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { BookingsServices } from './bookings.service';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.bookingServiceIntoDB(
    req.user,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking checkout session created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.getAllBookings(req.user, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.bokkings,
    pagination: result.pagination,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.updateBookingStatus(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

export const BookingsController = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
};
