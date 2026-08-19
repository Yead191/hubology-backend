import { JwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { IRefund } from './refund.interface';
import { Refund } from './refund.model';
import { Order } from '../order/order.model';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { ORDER_STATUS } from '../../../enums/orders';
import { USER_ROLES } from '../../../enums/user';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { NotificationServices } from '../notification/notification.service';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import config from '../../../config';
import { logger } from '../../../shared/logger';
import { processAdminRefund } from '../../../handlers/handleChargeRefunded';

const createRefundToDB = async (
  user: JwtPayload,
  payload: IRefund,
  orderId: string,
) => {
  try {
    const order = await Order.findOne({
      _id: orderId,
      user: user.id,
    });
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }
    if (order.payment_status !== 'paid') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only paid orders can be refunded.',
      );
    }

    if (!order.payment_intent_id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Payment information not found for this order.',
      );
    }

    const { total_price, delivery_charge = 0 } = order.price_breakdown || {};
    const totalFundable = total_price - delivery_charge;

    if (totalFundable <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Refund can not be allowed for this order as delivery charges are non-refundable.',
      );
    }

    const existingRefund = await Refund.findOne({
      order: order._id,
      status: { $in: ['pending', 'processing'] },
    });
    if (existingRefund) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'A refund request is already being processed for this order.',
      );
    }

    const result = await Refund.create({
      user: user.id,
      order: order._id,
      reason: payload.reason,
      images: payload.images,
      status: 'pending',
    });

    const userDoc = await User.findById(user.id);

    // 1. In-App Notification to User
    try {
      await NotificationServices.createNotification({
        receiver: user.id,
        title: 'Refund Request Submitted',
        message: `Your refund request for order #${order.order_id} has been submitted.`,
        refId: result._id,
        path: '/orders',
      });
    } catch (notifErr) {
      logger.error('Error sending user refund request notification:', notifErr);
    }

    // 2. In-App Notification to Admins
    try {
      await NotificationServices.sendNotificationToAdmins({
        title: 'New Refund Request',
        message: `Refund requested for order #${order.order_id} by ${userDoc?.name || 'Customer'}.`,
        refId: result._id,
        path: '/refunds',
      });
    } catch (notifErr) {
      logger.error(
        'Error sending admin refund request notification:',
        notifErr,
      );
    }

    // 3. User Email
    if (userDoc?.email) {
      try {
        const userEmailData = emailTemplate.refundRequestUserConfirmation({
          email: userDoc.email,
          name: userDoc.name || 'Customer',
          orderId: order.order_id,
          reason: payload.reason,
        });
        await emailHelper.sendEmail(userEmailData);
      } catch (emailErr) {
        logger.error('Error sending user refund request email:', emailErr);
      }
    }

    // 4. Admin Email(s)
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
        const adminEmailData = emailTemplate.refundRequestAdminNotification({
          adminEmail: adminEmail as string,
          adminName: 'Admin',
          customerName: userDoc?.name || 'Customer',
          customerEmail: userDoc?.email || 'N/A',
          orderId: order.order_id,
          reason: payload.reason,
        });
        await emailHelper.sendEmail(adminEmailData);
      }
    } catch (emailErr) {
      logger.error('Error sending admin refund request email:', emailErr);
    }

    return result;
  } catch (err: any) {
    if (payload.images) {
      for (const img of payload.images) {
        unlinkFile(img);
      }
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, err.message);
  }
};

const reviewRefundInDB = async (
  adminUser: JwtPayload,
  refundId: string,
  payload: {
    status: 'refunded' | 'rejected';
    refundType?: 'full' | 'partial';
    refundAmount?: number;
    adminNote?: string;
  },
) => {
  return await processAdminRefund(refundId, payload);
};

const getAllRefund = async (user: JwtPayload, query: Record<string, any>) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? {}
    : { user: user.id };

  const qb = new QueryBuilder(
    Refund.find(initQuery)
      .populate({
        path: 'user',
        select: 'name email image',
      })
      .populate({
        path: 'order',
        select:
          'status payment_status order_id price_breakdown total_items contact_number payment_intent_id',
      }),
    query,
  )
    .search(['user', 'order'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [refunds, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return { refunds, pagination };
};

const getSingleRefund = async (id: string) => {
  const result = await Refund.findById(id)
    .populate(
      'order',
      ' status payment_status order_id price_breakdown total_items contact_number payment_intent_id',
    )
    .populate('user', 'name email image');

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Refund request not found.');
  }

  return result;
};

export const RefundServices = {
  createRefundToDB,
  reviewRefundInDB,
  getAllRefund,
  getSingleRefund,
};
