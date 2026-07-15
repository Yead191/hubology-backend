import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CommentValidations } from './comment.validation';
import { CommentController } from './comment.controller';

const router = express.Router();


router.route('/my-comments').get(auth(), CommentController.getMyComments)


router.route('/:id')
    .post(auth(), validateRequest(CommentValidations.createCommentZodSchema), CommentController.createCommentToDB)
    .patch(auth(), validateRequest(CommentValidations.updateCommentZodSchema), CommentController.updateComment)
    .delete(auth(), CommentController.deleteComment)
    .get(auth(), CommentController.getAllCommentsByPost)


export const CommentRoutes = router;
