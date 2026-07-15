import express from 'express';
import { CommunityController } from './community.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CommunityValidations } from './community.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.route('/').get(auth(USER_ROLES.USER, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CommunityController.getAllPosts).post(auth(USER_ROLES.USER, USER_ROLES.VENDOR), fileUploadHandler(), validateRequest(CommunityValidations.createCommunity), CommunityController.createPost)


router.route('/my-posts').get(auth(USER_ROLES.USER, USER_ROLES.VENDOR), CommunityController.getMyPosts)


router.route('/:id').get(auth(USER_ROLES.USER, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CommunityController.getSignglePost).patch(auth(USER_ROLES.USER, USER_ROLES.VENDOR), validateRequest(CommunityValidations.updateCommunity), CommunityController.updatePost).delete(auth(USER_ROLES.USER, USER_ROLES.VENDOR), CommunityController.deletePost)



export const CommunityRoutes = router;
