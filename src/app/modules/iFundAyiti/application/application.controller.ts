import { Request, Response, NextFunction } from 'express';
import { ApplicationServices } from './application.service';
import catchAsync from '../../../../shared/catchAsync';
import { getSingleFilePath } from '../../../../shared/getFilePath';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


const createApplication = catchAsync(async (req: Request, res: Response) => {
    let data = { ...req.body }
    data.personal = JSON.parse(req.body.personal)
    data.contact = JSON.parse(req.body.contact)
    data.identification = JSON.parse(req.body.identification)
    data.grant = JSON.parse(req.body.grant)
    data.background = JSON.parse(req.body.background)
    const nid_card = getSingleFilePath(req.files, 'nid_card');
    const proof_of_address = getSingleFilePath(req.files, 'proof_of_address');
    const business_plan = getSingleFilePath(req.files, 'business_plan');


    const documentTypes = [{
        type: "nid_card",
        url: nid_card
    },
    {
        type: "proof_of_address",
        url: proof_of_address
    },
    {
        type: "business_plan",
        url: business_plan
    }
    ]
    data.documents = documentTypes;

    const result = await ApplicationServices.createApplicationToDB(data);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Application submitted successfully",
        data: result
    })
})


const getAllApplications = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplicationServices.getAllApplicationsFromDB(req.query)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Applications fetched successfully",
        data: result.applications,
        pagination: result.pagination
    })
})

const getSingleApplication = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplicationServices.getSingleApplicationFromDB(req.params.id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Application fetched successfully",
        data: result
    })
})

const trackApplication = catchAsync(async (req: Request, res: Response) => {
    // console.log(req.query)
    const result = await ApplicationServices.trackApplicationFromDB(req.query.email as string, req.query.dob as string)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Application fetched successfully",
        data: result
    })
})

export const ApplicationController = { createApplication, getAllApplications, getSingleApplication, trackApplication };
