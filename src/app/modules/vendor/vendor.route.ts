import express from "express";
import auth from "../../middlewares/auth";
import { VendorController } from "./vendor.controller";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router()


router.route('/').get(auth(), VendorController.getAllVendors)
router.route('/:id').get(auth(), VendorController.getSingleVendor)
router.route('/change-status/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VendorController.changeVendorStatus)

export const VendorRoutes = router