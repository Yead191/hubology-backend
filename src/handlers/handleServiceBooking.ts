import mongoose from 'mongoose';
import Stripe from 'stripe';
import { User } from '../app/modules/user/user.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { Services } from '../app/modules/services/services.model';
import { Bookings } from '../app/modules/bookings/bookings.model';
import { Coupon, CouponUser } from '../app/modules/coupon/coupon.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import config from '../config';
import { USER_ROLES } from '../enums/user';

export const handleServiceBooking = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    const metadata = checkoutSession?.metadata || {};
    const serviceId = metadata?.serviceId;
    const userId = metadata?.userId;
    const couponCode = metadata?.coupon || '';

    if (!userId) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return;
    }

    const serviceDetails = await Services.findById(serviceId)
      .lean()
      .session(mongoSession);

    // 1. Find User
    let user: any = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).session(mongoSession);
    }
    if (!user) {
      console.error('[Service Booking] User not found for userId:', userId);
      throw new Error('User not found');
    }

    const originalPrice = checkoutSession?.amount_subtotal
      ? checkoutSession.amount_subtotal / 100
      : serviceDetails?.price?.amount || 0;
    const amountPaid = checkoutSession?.amount_total
      ? checkoutSession.amount_total / 100
      : originalPrice;
    let discountAmount = checkoutSession?.total_details?.amount_discount
      ? checkoutSession.total_details.amount_discount / 100
      : originalPrice > amountPaid
        ? originalPrice - amountPaid
        : 0;

    let discountPercentage = 0;
    let couponDoc: any = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({ coupon_code: couponCode }).session(
        mongoSession,
      );

      if (couponDoc) {
        if (couponDoc.type === 'percentage') {
          discountPercentage = couponDoc.amount;
          if (!discountAmount) {
            discountAmount = (originalPrice * couponDoc.amount) / 100;
          }
        } else if (couponDoc.type === 'fixed') {
          discountPercentage = 0;
          if (!discountAmount) {
            discountAmount = couponDoc.amount;
          }
        }

        // Track user's coupon usage and increment total_uses
        await CouponUser.create(
          [
            {
              coupon: couponDoc._id,
              user: user._id,
            },
          ],
          { session: mongoSession },
        );
      }
    }

    const paymentTxnId =
      (checkoutSession.payment_intent as string) || checkoutSession.id;

    // 2. Update Booking record status
    await Bookings.create(
      [
        {
          user: user._id,
          service: serviceId!,
          paymentStatus: 'paid',
          status: 'pending',
          paymentIntentId: paymentTxnId,
          price: originalPrice,
          updatedPrice: amountPaid,
          coupon: couponCode,
          discountType: couponDoc?.type,
          discountAmount: discountAmount,
          discountPercentage: discountPercentage,
          note: metadata?.note || '',
          phone: metadata?.phone || '',
          preferredDate: metadata?.preferredDate || '',
          preferredTime: metadata?.preferredTime || '',
        },
      ],
      { session: mongoSession },
    );

    // 3. Create Transaction record
    await Transaction.create(
      [
        {
          user: user._id,
          total_price: originalPrice,
          payment_received: amountPaid,
          discount_amount: discountAmount,
          discount_percentage: discountPercentage,
          status: TRANSACTION_STATUS.SUCCESS,
          type: TRANSACTION_TYPE.CREDIT,
          category: TRANSACTION_CATEGORY.SERVICE,
          transaction_id: paymentTxnId,
        },
      ],
      { session: mongoSession },
    );

    // 4. Send In-App Notifications
    await NotificationServices.createNotification({
      receiver: user._id,
      title: 'Service Booked',
      message: `Your ${serviceDetails?.title || 'service'} booking is now confirmed!`,
      refId: serviceDetails?._id!,
      path: '/dashboard/bookings',
    });

    await NotificationServices.sendNotificationToAdmins({
      title: 'New Service Booked',
      message: `${user.name} booked ${serviceDetails?.title || 'a service'} ($${amountPaid}).`,
      refId: serviceDetails?._id!,
      path: '/services/bookings',
    });

    // 5. Send Email to User
    if (user.email) {
      const userEmailData = emailTemplate.serviceBookingUserConfirmation({
        email: user.email,
        name: user.name || 'Customer',
        serviceTitle: serviceDetails?.title || 'Service',
        price: amountPaid,
        originalPrice: originalPrice,
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || undefined,
        phone: metadata?.phone || user?.phone || '',
        preferredDate: metadata?.preferredDate || '',
        preferredTime: metadata?.preferredTime || '',
        note: metadata?.note || '',
        transactionId: paymentTxnId,
      });
      await emailHelper.sendEmail(userEmailData);
    }

    // 6. Send Email to Super Admin & Admins
    const admins = await User.find({
      $or: [{ role: USER_ROLES.ADMIN }, { role: USER_ROLES.SUPER_ADMIN }],
    });

    const adminEmails = Array.from(
      new Set(
        [...admins.map(a => a.email), config.super_admin.email].filter(Boolean),
      ),
    );

    for (const adminEmail of adminEmails) {
      const adminEmailData = emailTemplate.serviceBookingAdminNotification({
        adminEmail: adminEmail as string,
        customerName: user.name || 'Customer',
        customerEmail: user.email || 'N/A',
        serviceTitle: serviceDetails?.title || 'Service',
        price: amountPaid,
        originalPrice: originalPrice,
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || undefined,
        phone: metadata?.phone || user?.phone || '',
        preferredDate: metadata?.preferredDate || '',
        preferredTime: metadata?.preferredTime || '',
        note: metadata?.note || '',
        transactionId: paymentTxnId,
      });
      await emailHelper.sendEmail(adminEmailData);
    }

    await mongoSession.commitTransaction();
    mongoSession.endSession();
  } catch (error) {
    if (mongoSession.inTransaction()) {
      await mongoSession.abortTransaction();
    }
    mongoSession.endSession();
    console.error('[Service Booking Error]:', error);
  }
};
