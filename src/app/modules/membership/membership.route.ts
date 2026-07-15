import express from 'express';
import { MembershipController } from './membership.controller';

const router = express.Router();

router.get('/', MembershipController); 

export const MembershipRoutes = router;
