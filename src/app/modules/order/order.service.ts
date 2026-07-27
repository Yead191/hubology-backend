import { JwtPayload } from 'jsonwebtoken';
import { OrderModel, OrderPayload } from './order.interface';
import { Cart } from '../cart/cart.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CartHelper } from '../cart/cart.helper';
import { Order } from './order.model';
import config from '../../../config';
import stripe from '../../../config/stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { ORDER_STATUS } from '../../../enums/orders';

const createOrderToDb = async (user: JwtPayload, payload: OrderPayload) => {
  const myCart = await Cart.find({ user: user.id })
    .populate('product', 'title image')
    .lean()
    .exec();

  if (!myCart || myCart.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
  }
  const price_breakdown = CartHelper.calculateThePrice(myCart);

  const items = myCart.map((item: any) => ({
    title: item.product.title,
    image: item.product.image,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));

  const order = {
    user: user.id,
    items,
    price_breakdown,
    formatted_address: `${payload.street_address}, ${payload.city}, ${payload.postal_code}, ${payload.country}`,
    address_breakdown: payload,
    contact_number: payload.contact_number,
    total_items: items.length,
  };
  const line_items = myCart.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
        images: [
          `http://${config.ip_address}:${config.port}/files/${item.product.image}`,
        ],
      },
      unit_amount: item.total_price * 100,
    },
    quantity: item.quantity,
  }));
  if (price_breakdown.delivery_charge) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Charge',
          images: [],
        },
        unit_amount: price_breakdown.delivery_charge * 100,
      },
      quantity: 1,
    });
  }
  if (price_breakdown.serviceFee) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Service Fee',
          images: [],
        },
        unit_amount: price_breakdown.serviceFee * 100,
      },
      quantity: 1,
    });
  }
  //   tax
  if (price_breakdown.tax) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax',
          images: [],
        },
        unit_amount: price_breakdown.tax * 100,
      },
      quantity: 1,
    });
  }

  const createOrder = await Order.create(order);
  if (!createOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order creation failed');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `https://hubology-frontend.vercel.app/checkout?status=success`,
    cancel_url: `https://hubology-frontend.vercel.app/checkout?status=failed`,
    metadata: {
      userId: user.id!,
      orderId: createOrder._id.toString()!,
    },
  });
  if (!session.url) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not created!');
  }
  return session.url;
};

const getOrdersFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? { payment_status: 'paid' }
    : { user: user.id, payment_status: 'paid' };

  const qb = new QueryBuilder(
    Order.find(initQuery).populate({
      path: 'user',
      select: 'name email image',
    }),
    query,
  )
    .search(['title', 'order_id', 'transaction_id', 'contact_number'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [orders, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return { orders, pagination };
};

const changeOrderStatus = async (id: string, status: ORDER_STATUS) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found');
  }

  if ([ORDER_STATUS.DELIVERD, ORDER_STATUS.CANCELLED].includes(order.status))
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Order already' + order.status + '!',
    );
  if (status === ORDER_STATUS.PROCESSING) {
    await Order.findByIdAndUpdate(
      { _id: id },
      { status: ORDER_STATUS.PROCESSING },
    );
  }
};

export const OrderServices = {
  createOrderToDb,
  getOrdersFromDB,
  changeOrderStatus,
};
