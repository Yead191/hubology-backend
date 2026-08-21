import express from 'express';
import { RefundController } from './refund.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RefundValidations } from './refund.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    RefundController.getAllRefund,
  );

router
  .route('/:id')
  .post(
    auth(),
    fileUploadHandler(),
    validateRequest(RefundValidations.createRefundZodSchema),
    RefundController.createRefund,
  )
  .get(auth(), RefundController.getSingleRefund)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(RefundValidations.reviewRefundZodSchema),
    RefundController.reviewRefund,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    RefundController.deleteRefund,
  );

export const RefundRoutes = router;
