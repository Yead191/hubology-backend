import { Request, Response, } from 'express';
import { ServicesServices } from './services.service';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createService = catchAsync(async (req: Request, res: Response) => {
    let data = { ...req.body }
    const image = getSingleFilePath(req.files, 'image')
    console.log(image, 'image')
    if (image) {
        data.image = image
    }
    if (data.price) {
        data.price = JSON.parse(data.price)
    }
    if (data.features) {
        data.features = JSON.parse(data.features)
    }
    if (data.featured !== undefined) {
        data.featured = data.featured === 'true'
    }
    const result = await ServicesServices.createService(data)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Service created successfully',
        data: result
    })
})

const getAllServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ServicesServices.getAllServices()
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All services retrived successfully!"
        ,
        data: result
    })
})

const getSingleService = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await ServicesServices.getSingleService(id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Service retrived successfully!",
        data: result
    })
})

const updateService = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    let data = { ...req.body }
    const image = getSingleFilePath(req.files, 'image')
    if (image) {
        data.image = image
    }
    if (data.price) {
        data.price = JSON.parse(data.price)
    }
    if (data.featured !== undefined) {
        data.featured = data.featured === 'true'
    }
    console.log(data)


    const result = await ServicesServices.updateService(id, data)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Service updated successfully!",
        data: result
    })
})

const deleteService = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await ServicesServices.deleteService(id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Service deleted successfully!",
        data: result
    })
})

export const ServicesController = { createService, getAllServices, getSingleService, updateService, deleteService };
