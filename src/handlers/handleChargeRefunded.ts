import Stripe from 'stripe';
import { JwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import stripe from '../config/stripe';
import config from '../config';
import ApiError from '../errors/ApiError';
import { Order } from '../app/modules/order/order.model';
import { Refund } from '../app/modules/refund/refund.model';
import { User } from '../app/modules/user/user.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { ORDER_STATUS } from '../enums/orders';
import { USER_ROLES } from '../enums/user';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import { logger } from '../shared/logger';

export const processAdminRefund = async (
  refundId: string,
  payload: {
    status: 'refunded' | 'rejected';
    refundType?: 'full' | 'partial';
    refundAmount?: number;
    adminNote?: string;
  },
) => {
  const refund = await Refund.findById(refundId)
    .populate('order')
    .populate('user', 'name email image');

  if (!refund) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Refund request not found.');
  }

  if (refund.status === 'refunded' || refund.status === 'rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Refund request is already ${refund.status}.`,
    );
  }

  const order = await Order.findById(refund.order).lean();
  const customer = await User.findById(refund.user).lean();
  const customerName = customer?.name || 'Customer';
  const customerEmail = customer?.email;

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Associated order not found.');
  }

  // Case A: Reject Refund
  if (payload.status === 'rejected') {
    refund.status = 'rejected';
    refund.adminNote = payload.adminNote || '';
    refund.failureReason =
      payload.adminNote || 'Refund request rejected by admin.';
    await refund.save();

    // 1. In-app Notification to User
    if (customer?._id) {
      try {
        await NotificationServices.createNotification({
          receiver: customer._id,
          title: 'Refund Request Rejected',
          message: `Your refund request for order #${order.order_id} has been rejected.`,
          refId: refund._id,
          path: '/dashboard/orders',
        });
      } catch (notifErr) {
        logger.error(
          'Failed to send user refund rejection notification:',
          notifErr,
        );
      }
    }

    // 2. Email to User
    if (customerEmail) {
      try {
        const userEmailData = emailTemplate.refundRejectedUserConfirmation({
          email: customerEmail,
          name: customerName,
          orderId: order.order_id,
          adminNote: payload.adminNote,
        });
        await emailHelper.sendEmail(userEmailData);
      } catch (emailErr) {
        logger.error('Failed to send user refund rejection email:', emailErr);
      }
    }

    return refund;
  }

  // Case B: Approve & Connect Stripe Refund
  if (payload.status === 'refunded') {
    const refundType = payload.refundType || 'full';
    const totalOrderPrice = order?.price_breakdown?.total_price || 0;
    const deliveryCharge = order?.price_breakdown?.delivery_charge || 0;

    // Deduct non-refundable delivery charge from total paid
    const maxFundableAmount = Math.max(0, totalOrderPrice - deliveryCharge);

    if (maxFundableAmount <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No refundable amount available for this order after deducting delivery charge.',
      );
    }

    let refundAmount = 0;
    if (refundType === 'full') {
      refundAmount = maxFundableAmount;
    } else {
      if (!payload.refundAmount || payload.refundAmount <= 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Valid refund amount is required for partial refund.',
        );
      }
      if (payload.refundAmount > maxFundableAmount) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Refund amount ($${payload.refundAmount}) cannot exceed max refundable amount ($${maxFundableAmount} after deducting delivery charge).`,
        );
      }
      refundAmount = payload.refundAmount;
    }

    if (!order.payment_intent_id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Payment intent ID missing on order. Cannot process Stripe refund.',
      );
    }

    try {
      const stripeRefund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer',
        metadata: {
          refundId: refund._id.toString(),
          orderId: order._id.toString(),
        },
      });

      refund.status = 'refunded';
      refund.refundType = refundType;
      refund.refundAmount = refundAmount;
      refund.adminNote = payload.adminNote || '';
      refund.stripeRefundId = stripeRefund.id;
      await refund.save();

      // Update Order Payment Status and Order Status
      const isFullRefund =
        refundType === 'full' || refundAmount >= maxFundableAmount;
      await Order.findByIdAndUpdate(order._id, {
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        ...(isFullRefund ? { status: ORDER_STATUS.REFUNDED } : {}),
      });

      // Create Transaction Record
      try {
        await Transaction.create({
          user: refund.user,
          total_price: totalOrderPrice,
          payment_received: refundAmount,
          discount_percentage: 0,
          discount_amount: 0,
          platform_fee: 0,
          status: TRANSACTION_STATUS.SUCCESS,
          type: TRANSACTION_TYPE.DEBIT,
          category: TRANSACTION_CATEGORY.SHOP,
          order: order._id,
          transaction_id: stripeRefund.id,
        });
      } catch (txnErr) {
        logger.error('Failed to create refund transaction:', txnErr);
      }

      // 1. In-app Notification to User
      if (customer?._id) {
        try {
          await NotificationServices.createNotification({
            receiver: customer._id,
            title: 'Refund Approved',
            message: `Your refund request of $${refundAmount.toFixed(2)} for order #${order.order_id} has been approved.`,
            refId: refund._id,
            path: '/dashboard/orders',
          });
        } catch (notifErr) {
          logger.error(
            'Failed to send user refund approval notification:',
            notifErr,
          );
        }
      }

      // 2. In-app Notification to Admins
      try {
        await NotificationServices.sendNotificationToAdmins({
          title: 'Refund Processed',
          message: `Refund of $${refundAmount.toFixed(2)} for order #${order.order_id} was processed by admin.`,
          refId: refund._id,
          path: '/refunds',
        });
      } catch (notifErr) {
        logger.error(
          'Failed to send admin refund processed notification:',
          notifErr,
        );
      }

      // 3. Email to User
      if (customerEmail) {
        try {
          const userEmailData = emailTemplate.refundApprovedUserConfirmation({
            email: customerEmail,
            name: customerName,
            orderId: order.order_id,
            refundType: refundType,
            refundAmount: refundAmount,
            stripeRefundId: stripeRefund.id,
            adminNote: payload.adminNote,
          });
          await emailHelper.sendEmail(userEmailData);
        } catch (emailErr) {
          logger.error('Failed to send user refund approved email:', emailErr);
        }
      }

      // 4. Email to Admin(s)
      try {
        const admins = await User.find({
          $or: [{ role: USER_ROLES.ADMIN }, { role: USER_ROLES.SUPER_ADMIN }],
        });
        const adminEmails = Array.from(
          new Set(
            [...admins.map(a => a.email), config.super_admin.email].filter(
              Boolean,
            ),
          ),
        );
        for (const adminEmail of adminEmails) {
          const adminEmailData = emailTemplate.refundProcessedAdminNotification(
            {
              adminEmail: adminEmail as string,
              adminName: 'Admin',
              customerName,
              customerEmail: customerEmail || 'N/A',
              orderId: order.order_id,
              refundType: refundType,
              refundAmount: refundAmount,
              stripeRefundId: stripeRefund.id,
              adminNote: payload.adminNote,
            },
          );
          await emailHelper.sendEmail(adminEmailData);
        }
      } catch (emailErr) {
        logger.error('Failed to send admin refund processed email:', emailErr);
      }

      return refund;
    } catch (stripeErr: any) {
      refund.status = 'failed';
      refund.failureReason = stripeErr.message;
      await refund.save();
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Stripe Refund Failed: ${stripeErr.message}`,
      );
    }
  }
};

export const handleChargeRefunded = async (
  chargeOrRefund: Stripe.Charge | Stripe.Refund,
) => {
  try {
    let paymentIntentId: string | null = null;
    let stripeRefundId: string | null = null;

    if (chargeOrRefund.object === 'charge') {
      const charge = chargeOrRefund as Stripe.Charge;
      paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id || null;
    } else if (chargeOrRefund.object === 'refund') {
      const refundObj = chargeOrRefund as Stripe.Refund;
      stripeRefundId = refundObj.id;
      paymentIntentId =
        typeof refundObj.payment_intent === 'string'
          ? refundObj.payment_intent
          : refundObj.payment_intent?.id || null;
    }

    if (!paymentIntentId && !stripeRefundId) {
      logger.warn(
        'Stripe refund webhook received without payment_intent or refund ID',
      );
      return;
    }

    const orderQuery = paymentIntentId
      ? { payment_intent_id: paymentIntentId }
      : null;

    if (orderQuery) {
      const order = await Order.findOne(orderQuery);
      if (order) {
        if (order.payment_status !== 'refunded') {
          await Order.findByIdAndUpdate(order._id, {
            payment_status: 'refunded',
            status: ORDER_STATUS.REFUNDED,
          });
          logger.info(
            `Order #${order.order_id} status updated to REFUNDED via Stripe webhook`,
          );
        }

        const refundDoc = await Refund.findOne({
          order: order._id,
          status: { $in: ['pending', 'processing'] },
        });

        if (refundDoc) {
          refundDoc.status = 'refunded';
          if (stripeRefundId) refundDoc.stripeRefundId = stripeRefundId;
          await refundDoc.save();
          logger.info(
            `Refund request #${refundDoc._id} status updated to REFUNDED via Stripe webhook`,
          );
        }
      }
    }
  } catch (error) {
    logger.error('Error handling Stripe refund webhook:', error);
  }
};
