import { JwtPayload } from 'jsonwebtoken';
import { BookingsModel, IBookings } from './bookings.interface';
import ApiError from '../../../errors/ApiError';
import stripe from '../../../config/stripe';
import { StatusCodes } from 'http-status-codes';
import { Services } from '../services/services.model';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { Bookings } from './bookings.model';

const bookingServiceIntoDB = async (user: JwtPayload, payload: IBookings) => {
  payload.user = user.id;
  const service = await Services.findById(payload.service).lean();
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found!');
  }

  const line_items = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: service.title,
        },
        unit_amount: service.price.amount * 100,
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${config.frontend_url}/payment/success`,
    cancel_url: `${config.frontend_url}/payment/failed`,
    customer_email: user.email,
    metadata: {
      userId: user.id.toString(),
      type: 'service',
      serviceId: service._id.toString(),
      preferredDate: String(payload.preferredDate),
      preferredTime: payload.preferredTime,
      note: payload.note || '',
    },
  });
  if (!session.url) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking not created!');
  }
  return session.url;
};

const getAllBookings = async (user: JwtPayload, query: Record<string, any>) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? { paymentStatus: 'paid' }
    : { user: user.id, paymentStatus: 'paid' };

  const qb = new QueryBuilder(
    Bookings.find(initQuery)
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'service',
        select: 'title',
      }),
    query,
  )
    .search(['user.name', 'service.title'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [bokkings, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { bokkings, pagination };
};

export const BookingsServices = {
  bookingServiceIntoDB,
  getAllBookings,
};
