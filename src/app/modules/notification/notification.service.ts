import { Notification } from "./notification.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { INotification } from "./notification.interface";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

const createNotification = async (data: INotification) => {
    const result = await Notification.create(data);
    return result;
};

const sendNotificationToAdmins = async (payload: {
    title: string;
    message: string;
    refId: any;
    path: string;
}) => {
    const admins = await User.find({
        $or: [{ role: USER_ROLES.ADMIN }, { role: USER_ROLES.SUPER_ADMIN }]
    });

    await Promise.all(
        admins.map((admin) =>
            Notification.create({
                receiver: admin._id,
                title: payload.title,
                message: payload.message,
                refId: payload.refId,
                path: payload.path,
                seen: false
            })
        )
    );
};

const getAllNotifications = async (query: Record<string, any>) => {
    const notificationsQuery = new QueryBuilder(Notification.find().populate('sender receiver'), query)
        .search(['title', 'message'])
        .filter()
        .fields()
        .paginate()
        .sort();

    const [notifications, pagination] = await Promise.all([
        notificationsQuery.modelQuery.lean(),
        notificationsQuery.getPaginationInfo()
    ]);

    return { notifications, pagination };
};

const getSingleNotification = async (id: string) => {
    const isExist = await Notification.findById(id).populate('sender receiver');
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found');
    }
    return isExist;
};

const updateNotification = async (id: string, payload: Partial<INotification>) => {
    const isExist = await Notification.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found');
    }

    const result = await Notification.findOneAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
    );
    return result;
};

const deleteNotification = async (id: string) => {
    const isExist = await Notification.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found');
    }
    const result = await Notification.deleteOne({ _id: id });
    return result;
};

export const NotificationServices = {
    createNotification,
    sendNotificationToAdmins,
    getAllNotifications,
    getSingleNotification,
    updateNotification,
    deleteNotification
};
