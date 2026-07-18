import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { Applicationperiod } from '../applicationperiod/applicationperiod.model';
import { ApplicationModel, IApplication } from './application.interface';
import { Application } from './application.model';
import unlinkFile from '../../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../../enums/user';
import QueryBuilder from '../../../builder/QueryBuilder';
import mongoose from 'mongoose';

const createApplicationToDB = async (payload: IApplication) => {

    const currentPeriod = await Applicationperiod.findOne({ status: "Open" })
    if (!currentPeriod) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "No application period is currently open."
        );
    }
    const existingApplication = await Application.findOne({
        'contact.email': payload.contact.email,
        'personal.dob': payload.personal.dob,
        applicationPeriod: currentPeriod._id,
    });

    if (existingApplication) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You have already submitted an application for this period."
        );
    }
    const docs = payload.documents ?? [];

    for (const doc of docs) {
        if (doc.url) {
            unlinkFile(doc.url);
        }
    }

    payload.applicationPeriod = currentPeriod._id;

    const result = await Application.create(payload);

    return result;
}

// get all applications
const getAllApplicationsFromDB = async (query: Record<string, any>) => {

    const qb = new QueryBuilder(Application.find(), query)
        .search(["personal.first_name", "personal.last_name", "contact.email", "identification.nid_number"])
        .filter()
        .paginate()
        .sort().populate(["applicationPeriod"], {
            applicationPeriod: "title startDate endDate"
        })

    const [applications, pagination] = await Promise.all([
        qb.modelQuery.lean(),
        qb.getPaginationInfo()
    ])
    return { applications, pagination }
}

// get single application

const getSingleApplicationFromDB = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid application id");
    }
    const application = await Application.findById(id).populate("applicationPeriod", "title startDate endDate")
    if (!application) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Application not found");
    }
    return application
}

// track application
const trackApplicationFromDB = async (email: string, dob: string) => {
    if (!email || !dob) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Email and Birthdate is required");
    }
    const currentPeriod = await Applicationperiod.findOne({ status: { $in: ["Open", "Review"] } })
    if (!currentPeriod) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No application period is currently open or under review.");
    }
    const application = await Application.findOne({
        'contact.email': email,
        'personal.dob': new Date(dob),
        applicationPeriod: currentPeriod._id
    }).populate("applicationPeriod", "title startDate endDate")
    if (!application) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Application not found. Please check your email and birthdate. Or maybe application period is not open or under review.");
    }
    return application
}

export const ApplicationServices = {
    createApplicationToDB,
    getAllApplicationsFromDB,
    getSingleApplicationFromDB,
    trackApplicationFromDB
};
