import { NotificationServices } from '../notification/notification.service';
import { IService } from './services.interface';
import { Services } from './services.model';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';


const createService = async (payload: IService) => {

    if (payload.image) {
        unlinkFile(payload.image)
    }
    const result = await Services.create(payload);
    NotificationServices.sendNotificationToAdmins({
        title: "New Service Added",
        message: "A new service has been added to the platform",
        refId: result._id,
        path: `/services/${result._id}`
    }
    )
    return result;
}

const getAllServices = async () => {
    const result = await Services.find().sort({ createdAt: -1 });
    return result
}
const getSingleService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
    }
    const isExistService = await Services.findById(id)
    if (!isExistService) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!")
    }
    return isExistService
}

const updateService = async (id: string, payload: Partial<IService>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
    }
    const isExistService = await Services.findById(id)
    if (!isExistService) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!")
    }
    if (payload.image) {
        unlinkFile(isExistService.image)
    }
    const result = await Services.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true })
    return result
}

const deleteService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
    }
    const isExistService = await Services.findById(id)
    if (!isExistService) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!")
    }
    const result = await Services.deleteOne({ _id: id })
    return result
}


export const ServicesServices = {
    createService,
    getAllServices,
    getSingleService,
    updateService,
    deleteService
};