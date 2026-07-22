import { USER_ROLES } from "../../../enums/user";
import { Product } from "../book/book.model";
import { Community } from "../community/community.model";
import { Services } from "../services/services.model";
import { User } from "../user/user.model";

const getDashboardOverview = async () => {
    const [
        totalServices,
        totalUsers,
        approvedVendors,
        pendingVendors,
        totalProducts,
        reportedPost,
    ] = await Promise.all([
        Services.countDocuments(),
        User.countDocuments({
            role: USER_ROLES.USER,
        }),
        User.countDocuments({
            role: USER_ROLES.VENDOR,
            verified: true,
            status: "active",
        }),
        User.countDocuments({
            role: USER_ROLES.VENDOR,
            verified: false,
            status: "active",
        }),
        Product.countDocuments(),
        Community.countDocuments({
            reportCount: { $gte: 1 },
        }),
    ]);

    return {
        totalServices,
        totalUsers,
        approvedVendors,
        pendingVendors,
        totalProducts,
        reportedPost,
    };
};


export const DashboardOverviewServices = {
    getDashboardOverview
};
