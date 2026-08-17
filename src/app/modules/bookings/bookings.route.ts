import express from 'express';
import { BookingsController } from './bookings.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { BookingsValidations } from './bookings.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.VENDOR),
    validateRequest(BookingsValidations.createBookingZod),
    BookingsController.createBooking,
  )
  .get(auth(), BookingsController.getAllBookings);

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    BookingsController.updateBookingStatus,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    BookingsController.deleteBooking,
  );

export const BookingsRoutes = router;
