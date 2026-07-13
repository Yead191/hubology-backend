import QueryBuilder from "../../builder/QueryBuilder"
import { User } from "../user/user.model"
import { USER_ROLES } from "../../../enums/user"
import { JwtPayload } from "jsonwebtoken"
import mongoose from "mongoose"
import ApiError from "../../../errors/ApiError"
import { StatusCodes } from "http-status-codes"
import { IUser } from "../user/user.interface"

const getVendorsFromDB = async (user: JwtPayload, query: Record<string, any>,) => {
    let vendorQuery;

    if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN) {
        vendorQuery = new QueryBuilder(User.find({ role: USER_ROLES.VENDOR }), query).paginate().sort().search(['name', 'email', 'company']).filter(['availability', 'hourlyRateRange']).fields()
    } else {
        vendorQuery = new QueryBuilder(User.find({ role: USER_ROLES.VENDOR, verified: true, status: "active" }), query).paginate().sort().search(['name', 'email', 'company']).filter(['availability', 'hourlyRateRange']).fields()
    }

    if (query.availability) {
        vendorQuery.modelQuery = vendorQuery.modelQuery.find({
            'vendorProfile.availability': query.availability,
        });
    }
    // filter by hourly rate
    if (query.hourlyRateRange) {
        const [min, max] = query.hourlyRateRange.split('-').map(Number);
        vendorQuery.modelQuery = vendorQuery.modelQuery.find({
            'vendorProfile.hourlyRate': {
                $gte: min,
                $lte: max,
            },
        });
    }
    // filter by experience
    if (query.experienceRange) {
        const [min, max] = query.experienceRange.split('-').map(Number);
        vendorQuery.modelQuery = vendorQuery.modelQuery.find({
            'vendorProfile.yearsExperience': {
                $gte: min,
                $lte: max,
            },
        });
    }

    const [vendors, pagination] = await Promise.all([
        vendorQuery.modelQuery.lean(),
        vendorQuery.getPaginationInfo()
    ])

    return { vendors, pagination }
}

const getSingleVendorFromDB = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user id");
    }
    const isVendorExist = await User.findById(id)
    if (!isVendorExist || isVendorExist.role !== USER_ROLES.VENDOR) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor not found");
    }
    return isVendorExist
}

const changeVendorStatus = async (id: string, payload: Pick<IUser, any>) => {
    // console.log(payload)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user id");
    }
    const isExist = await User.findById({ _id: id })
    if (!isExist || isExist.role !== USER_ROLES.VENDOR) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor not found");
    }
    const result = await User.updateOne({
        _id: id,

    }, { $set: { status: payload.status, rejectionReason: payload.status === "rejected" ? payload.rejectionReason : null } })
    if (!result.modifiedCount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor status not changed");
    }
    return result
}


export const VendorService = {
    getVendorsFromDB,
    getSingleVendorFromDB,
    changeVendorStatus
}