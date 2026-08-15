import express from 'express';
import auth from '../../middlewares/auth';
import { VendorController } from './vendor.controller';
import { USER_ROLES } from '../../../enums/user';
import tempAuth from '../../middlewares/tempAuth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from '../auth/auth.validation';
import { UserValidation } from '../user/user.validation';

const router = express.Router();

router
  .route('/create')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(AuthValidation.createRegisterVendorZodSchema),
    VendorController.createVendorByAdmin,
  );

router.route('/').get(tempAuth(), VendorController.getAllVendors);

router
  .route('/change-status/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    VendorController.changeVendorStatus,
  );

router
  .route('/change-profile-visibility/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(UserValidation.updateProfileVisibilityZodSchema),
    VendorController.changeProfileVisibility,
  );
router
  .route('/:id')
  .get(VendorController.getSingleVendor)
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    VendorController.deleteVendor,
  );
export const VendorRoutes = router;
