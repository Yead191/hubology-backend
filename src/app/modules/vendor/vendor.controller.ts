import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { VendorService } from './vendor.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createVendorByAdmin = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const data = { ...req.body };
  if (image) {
    data.image = image;
  }
  if (req?.body?.vendorProfile && typeof req.body.vendorProfile === 'string') {
    try {
      data.vendorProfile = JSON.parse(req.body.vendorProfile);
    } catch (err) {
      // If already an object or unparseable, leave as is
    }
  }

  const result = await VendorService.createVendorByAdmin(data);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Vendor created successfully by Admin.',
    data: result,
  });
});

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await VendorService.getVendorsFromDB(user, req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All vendors retrived successfully!',
    data: result.vendors,
    pagination: result.pagination,
  });
});

const getSingleVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.getSingleVendorFromDB(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Vendor retrived successfully!',
    data: result,
  });
});
const changeVendorStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  console.log(status, id);
  const result = await VendorService.changeVendorStatus(id, {
    status,
    rejectionReason,
  });
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Vendor status changed successfully!',
    data: result,
  });
});

const deleteVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.deleteVendorService(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Vendor deleted successfully!',
    data: result,
  });
});

export const VendorController = {
  createVendorByAdmin,
  getAllVendors,
  getSingleVendor,
  changeVendorStatus,
  deleteVendor,
};
