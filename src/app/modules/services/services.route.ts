import express from 'express';
import { ServicesController } from './services.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ServicesValidations } from './services.validation';

const router = express.Router();

router.route('/').get(ServicesController.getAllServices).post(auth(USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN), fileUploadHandler(),
    validateRequest(ServicesValidations.createServicesZodSchema),
    ServicesController.createService)

router.route('/:id').get(ServicesController.getSingleService).patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(), validateRequest(ServicesValidations.updateServicesZodSchema), ServicesController.updateService).delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ServicesController.deleteService)

export const ServicesRoutes = router;
