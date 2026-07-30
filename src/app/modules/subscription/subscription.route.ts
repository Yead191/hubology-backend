import express from 'express';
import { SubscriptionController } from './subscription.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(auth(), SubscriptionController.getMySubcription);

router
  .route('/subscribers/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    SubscriptionController.getSubsribersByPackage,
  );

router.post('/subscribe/:id', auth(), SubscriptionController.subscribePackage);

export const SubscriptionRoutes = router;
