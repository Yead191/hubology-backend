import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { VendorService } from "./vendor.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await VendorService.getVendorsFromDB(user, req.query)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All vendors retrived successfully!",
        data: result.vendors,
        pagination: result.pagination
    })

})

const getSingleVendor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await VendorService.getSingleVendorFromDB(id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Vendor retrived successfully!",
        data: result
    })
})
const changeVendorStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body
    console.log(status, id)
    const result = await VendorService.changeVendorStatus(id, { status })
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Vendor status changed successfully!",
        data: result
    })
})

export const VendorController = {
    getAllVendors,
    getSingleVendor,
    changeVendorStatus
}