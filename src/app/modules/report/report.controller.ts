import { Request, Response, NextFunction } from 'express';
import { ReportServices } from './report.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

import { StatusCodes } from 'http-status-codes';

const createReport = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportServices.createReportToDB(req.user, req.body)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Report created successfully",
        data: result
    })
})

const getAllReports = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportServices.getAllReportsFromDb(req.query)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result.reports,
        pagination: result.pagination

    })
})

const reviewReport = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body
    const result = await ReportServices.reviewReportToDB(req.params.id, status)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Report reviewed successfully",
        data: result
    })
})

const getReportByPostId = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportServices.getReportsByPost(req.params.id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Report found successfully",
        data: result
    })
})

const deleteReport = catchAsync(async (req: Request, res: Response) => {
    const result = await ReportServices.deleteReportFromDb(req.params.id)
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Report deleted successfully",
        data: result
    })
})

export const ReportController = { createReport, getAllReports, reviewReport, getReportByPostId, deleteReport };
