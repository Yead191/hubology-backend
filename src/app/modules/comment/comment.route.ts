import express from 'express';
import { CommentController } from './comment.controller';

const router = express.Router();

router.get('/', CommentController); 

export const CommentRoutes = router;
