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
        vendorQuery = new QueryBuilder(User.find({ role: USER_ROLES.VENDOR }), query).paginate().sort().search(['name', 'email', 'company']).filter().fields()
    } else {
        vendorQuery = new QueryBuilder(User.find({ role: USER_ROLES.VENDOR, verified: true, status: "active" }), query).paginate().sort().search(['name', 'email', 'company']).filter().fields()
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

const changeVendorStatus = async (id: string, payload: Pick<IUser, "status">) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user id");
    }
    const isExist = await User.findById({ _id: id })
    if (!isExist || isExist.role !== USER_ROLES.VENDOR) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor not found");
    }
    const result = await User.updateOne({
        _id: id,

    }, { $set: { status: payload.status } })
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