import express from 'express';
import { SubscriptionController } from './subscription.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/subscribe/:id', auth(), SubscriptionController.subscribePackage);

export const SubscriptionRoutes = router;
