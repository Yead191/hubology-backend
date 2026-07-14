import express from 'express';
import { CommunityController } from './community.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CommunityValidations } from './community.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.route('/').get(CommunityController.getAllPosts).post(auth(USER_ROLES.USER, USER_ROLES.VENDOR), fileUploadHandler(), validateRequest(CommunityValidations.createCommunity), CommunityController.createPost)

router.route('/:id').patch(auth(USER_ROLES.USER, USER_ROLES.VENDOR), validateRequest(CommunityValidations.createCommunity), CommunityController.updatePost).delete(auth(USER_ROLES.USER, USER_ROLES.VENDOR), CommunityController.deletePost)

export const CommunityRoutes = router;
