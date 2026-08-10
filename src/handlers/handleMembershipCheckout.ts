import mongoose from 'mongoose';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Membership } from '../app/modules/membership/membership.model';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';

export const handleMembershipCheckout = async (
  checkoutSession: Stripe.Checkout.Session | Stripe.Subscription | any,
) => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    const metadata = checkoutSession?.metadata || {};
    // console.log(metadata);
    const membershipId = metadata?.membershipId;
    const userId = metadata?.userId;
    if (!metadata?.userId) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return;
    }
    // prevent duplicate transaction Id
    const stripeSubscriptionId =
      typeof checkoutSession.subscription === 'string'
        ? checkoutSession.subscription
        : (checkoutSession as any).subscription?.id || checkoutSession.id;

    // Check for existing transaction using session ID or subscription ID
    const existingTransaction = await Transaction.findOne({
      transaction_id: { $in: [checkoutSession.id, stripeSubscriptionId] },
    }).session(mongoSession);

    if (existingTransaction) {
      console.log(
        `[Membership Checkout] Transaction already processed for ID: ${checkoutSession.id} / ${stripeSubscriptionId}`,
      );
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return;
    }

    // 1. Find User
    let user: any = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).session(mongoSession);
    }
    if (!user) {
      console.error(
        '[Membership Checkout] User not found for email:',
        'userId:',
        userId,
      );
      throw new Error('User not found');
    }

    // 2. Find Membership
    let membership: any = null;
    if (membershipId && mongoose.Types.ObjectId.isValid(membershipId)) {
      membership =
        await Membership.findById(membershipId).session(mongoSession);
    }

    if (!membership) {
      // Fallback: List session line items to match priceId or productId
      const lineItems = await stripe.checkout.sessions.listLineItems(
        checkoutSession.id,
      );
      const priceId = lineItems.data[0]?.price?.id;
      const productId = lineItems.data[0]?.price?.product as string;

      if (priceId || productId) {
        membership = await Membership.findOne({
          $or: [{ priceId }, { productId }],
        }).session(mongoSession);
      }
    }

    if (!membership) {
      console.error(
        '[Membership Checkout] Membership plan not found for session:',
        checkoutSession.id,
      );
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return;
    }

    // 3. Deactivate any existing active subscriptions for this user
    await Subscription.updateMany(
      { user: user._id, status: 'active' },
      { status: 'inactive' },
    ).session(mongoSession);

    // 4. Calculate subscription start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    const intervalCount = membership.interval || 1;
    if (membership.recurring === 'year') {
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
    } else {
      endDate.setMonth(endDate.getMonth() + intervalCount);
    }

    // 5. Store information in Subscription model
    const [subscription] = await Subscription.create(
      [
        {
          user: user._id,
          plan: membership._id,
          name: membership.name,
          recuring: membership.recurring === 'year' ? 'year' : 'month',
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          price: membership.price,
          features: membership.features || [],
          payment_intent_id: stripeSubscriptionId,
          trxId: stripeSubscriptionId,
        },
      ],
      { session: mongoSession },
    );

    // Update User model with the new Subscription ID
    await User.findByIdAndUpdate(
      user._id,
      { subscription: subscription._id },
      { session: mongoSession },
    );

    // 6. Create Transaction record
    await Transaction.create(
      [
        {
          user: user._id,
          total_price: membership.price,
          payment_received: membership.price,
          status: TRANSACTION_STATUS.SUCCESS,
          type: TRANSACTION_TYPE.CREDIT,
          category: TRANSACTION_CATEGORY.MEMBERSHIP,
          transaction_id: stripeSubscriptionId,
        },
      ],
      { session: mongoSession },
    );

    // 7. Send Notifications & Email
    await NotificationServices.createNotification({
      receiver: user._id,
      title: 'Membership Activated',
      message: `Your ${membership.name} membership plan is now active!`,
      refId: subscription._id,
      path: '/dashboard/subscriptions',
    });

    await NotificationServices.sendNotificationToAdmins({
      title: 'New Membership Subscription',
      message: `${user.name} subscribed to ${membership.name} ($${membership.price}).`,
      refId: subscription._id,
      path: `/membership/${membership?._id?.toString()}/subscribers`,
    });

    if (user.email) {
      const emailData = emailTemplate.orderStatusUpdate({
        email: user.email,
        name: user.name || 'Member',
        orderId: membership.name,
        status: `Active (${membership.name})`,
        totalPrice: membership.price,
      });
      await emailHelper.sendEmail(emailData);
    }

    await mongoSession.commitTransaction();
    mongoSession.endSession();
  } catch (error) {
    if (mongoSession.inTransaction()) {
      await mongoSession.abortTransaction();
    }
    mongoSession.endSession();
    console.error('[Membership Checkout Error]:', error);
  }
};
