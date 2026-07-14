import express from 'express';
import { LikeController } from './like.controller';

const router = express.Router();

router.get('/', LikeController); 

export const LikeRoutes = router;
