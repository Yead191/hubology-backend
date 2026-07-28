import express from 'express';
import { BookingsController } from './bookings.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.VENDOR),
    BookingsController.createBooking,
  )
  .get(auth(), BookingsController.getAllBookings);

export const BookingsRoutes = router;
