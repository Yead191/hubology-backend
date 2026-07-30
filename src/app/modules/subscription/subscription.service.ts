import { JwtPayload } from 'jsonwebtoken';
import { SubscriptionModel } from './subscription.interface';
import { Membership } from '../membership/membership.model';
import ApiError from '../../../errors/ApiError';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Subscription } from './subscription.model';

const subscribePackage = async (user: JwtPayload, packageId: string) => {
  const membership = await Membership.findOne({ _id: packageId });

  if (!membership) {
    throw new ApiError(404, 'Membership not found');
  }

  const subscriptionCheckoutSession = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: membership.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${config.frontend_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-failed?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      membershipId: packageId,
    },
  });

  if (!subscriptionCheckoutSession.url) {
    throw new ApiError(500, 'Failed to create subscription checkout session');
  }

  return subscriptionCheckoutSession.url;
};

const getMySubcription = async (user: JwtPayload) => {
  const result = await Subscription.find({ user: user.id }).populate(
    'user',
    'name email',
  );
  if (!result.length) {
    throw new ApiError(404, 'No subscription found!');
  }
  return result;
};

export const SubscriptionServices = {
  subscribePackage,
  getMySubcription,
};
