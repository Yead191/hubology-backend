import { Request, Response } from 'express';
import { RefundServices } from './refund.service';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createRefund = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const images = getMultipleFilesPath(req.files, 'image');
  data.images = images?.map((url: string) => url);

  const result = await RefundServices.createRefundToDB(
    req.user,
    data,
    req.params.id,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Refund requested successfully',
    data: result,
  });
});

const reviewRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundServices.reviewRefundInDB(
    req.user,
    req.params.id,
    req.body,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `Refund request ${req.body.status} successfully`,
    data: result,
  });
});

const getAllRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundServices.getAllRefund(req.user, req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Refunds fetched successfully',
    pagination: result.pagination,
    data: result.refunds,
  });
});

const getSingleRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundServices.getSingleRefund(req.params.id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Refund request fetched successfully',
    data: result,
  });
});

const deleteRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundServices.deleteRefundFromDB(req.params.id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Refund request deleted successfully',
    data: result,
  });
});

export const RefundController = {
  createRefund,
  reviewRefund,
  getAllRefund,
  getSingleRefund,
  deleteRefund,
};
