import express from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    EventController.createEvent,
  )
  .get(tempAuth(), EventController.getAllEvents);

router
  .route('/:id')
  .get(tempAuth(), EventController.getSingleEvent)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    EventController.updateEvent,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    EventController.deleteEvent,
  );

export const EventRoutes = router;
