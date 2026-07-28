import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Product } from '../app/modules/book/book.model';
import { Digital } from '../app/modules/digital/digital.model';

export const handleDigitalPurchase = async (
  payload: Stripe.Checkout.Session,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = payload?.metadata?.userId;
    const productId = payload?.metadata?.productId;
    const productInfo = await Product.findById(productId).lean();

    if (!productInfo) {
      throw new Error('Product not found!');
    }

    const digitalData = {
      user: userId,
      product: productInfo._id,
      price: Number(productInfo.price),
      paymentStatus: 'paid',
      paymentIntentId: payload?.payment_intent as string,
    };

    const result = await Digital.create([digitalData], { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    console.error(error);
  }
};
