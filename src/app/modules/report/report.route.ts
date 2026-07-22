import express from 'express';
import { ReportController } from './report.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { ReportValidations } from './report.validation';

const router = express.Router();

router.route('/').post(auth(), validateRequest(ReportValidations.createReport), ReportController.createReport).get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ReportController.getAllReports)

router.route('/:id').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ReportController.getReportByPostId).patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(ReportValidations.reviewReportZodSchema), ReportController.reviewReport).delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ReportController.deleteReport)

export const ReportRoutes = router;
