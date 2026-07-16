import express from 'express';
import { SubscriptionController } from './subscription.controller';

const router = express.Router();

router.get('/', SubscriptionController); 

export const SubscriptionRoutes = router;
