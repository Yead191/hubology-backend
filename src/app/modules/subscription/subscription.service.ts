import { JwtPayload } from 'jsonwebtoken';
import { Membership } from '../membership/membership.model';
import ApiError from '../../../errors/ApiError';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Subscription } from './subscription.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { StatusCodes } from 'http-status-codes';

const subscribePackage = async (user: JwtPayload, packageId: string) => {
  const membership = await Membership.findOne({ _id: packageId });

  if (!membership) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Membership not found');
  }

  if (membership.type !== user.role.toLowerCase()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You are ${user.role}, can't subscribe ${membership.type} membership.`,
    );
  }

  const subscriptionCheckoutSession = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: membership.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${config.frontend_url}/payment/success?type=membership`,
    cancel_url: `${config.frontend_url}/payment/failure?type=membership`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      membershipId: packageId,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        membershipId: packageId,
      },
      trial_period_days: membership.trial_period_days,
    },
  });

  if (!subscriptionCheckoutSession.url) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create subscription checkout session',
    );
  }

  return subscriptionCheckoutSession.url;
};

const getMySubcription = async (user: JwtPayload) => {
  const result = await Subscription.find({ user: user.id }).populate(
    'user',
    'name email',
  );
  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No subscription found!');
  }
  return result;
};

const getSubsribersByPackage = async (
  id: string,
  query: Record<string, any>,
) => {
  const qb = new QueryBuilder(
    Subscription.find({ plan: id })
      .populate('user', 'name email image')
      .populate('plan', 'name'),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    qb.modelQuery,
    qb.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const SubscriptionServices = {
  subscribePackage,
  getMySubcription,
  getSubsribersByPackage,
};
