import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Order } from '../app/modules/order/order.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../app/modules/transaction/transaction.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { Cart } from '../app/modules/cart/cart.model';

export const handleOrderPurchase = async (
  orderSession: Stripe.Checkout.Session,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { userId, orderId } = orderSession?.metadata as any;

    const orderDetails = await Order.findById(orderId)
      .populate('user')
      .session(session);

    if (!orderDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    const transaction = (
      await Transaction.create(
        [
          {
            user: userId,
            total_price: orderDetails.price_breakdown.total_price,
            payment_received: 0,
            discount_amount: 0,
            platform_fee: orderDetails.price_breakdown.serviceFee,
            status: TRANSACTION_STATUS.SUCCESS,
            type: TRANSACTION_TYPE.CREDIT,
            category: TRANSACTION_CATEGORY.SHOP,
            order: orderId,
          },
        ],
        { session },
      )
    )[0];

    await Cart.deleteMany({ user: userId }).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};
