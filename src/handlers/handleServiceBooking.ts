import mongoose from 'mongoose';
import Stripe from 'stripe';
import { User } from '../app/modules/user/user.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { Services } from '../app/modules/services/services.model';
import { Bookings } from '../app/modules/bookings/bookings.model';
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

    if (!userId) {
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

    const priceAmount = serviceDetails?.price?.amount || 0;
    const paymentTxnId =
      (checkoutSession.payment_intent as string) || checkoutSession.id;

    // 2. Update Booking record status
    await Bookings.create({
      user: user._id,
      service: serviceId!,
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentIntentId: paymentTxnId,
      price: priceAmount,
      note: metadata?.note || '',
      preferredDate: metadata?.preferredDate || '',
      preferredTime: metadata?.preferredTime || '',
    });

    // 3. Create Transaction record
    await Transaction.create(
      [
        {
          user: user._id,
          total_price: priceAmount,
          payment_received: priceAmount,
          platform_fee: 0,
          status: TRANSACTION_STATUS.SUCCESS,
          type: TRANSACTION_TYPE.CREDIT,
          category: TRANSACTION_CATEGORY.SERVICE,
          transaction_id: paymentTxnId,
        },
      ],
      { session: mongoSession },
    );

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    // 4. Send In-App Notifications
    try {
      await NotificationServices.createNotification({
        receiver: user._id,
        title: 'Service Booked',
        message: `Your ${serviceDetails?.title || 'service'} booking is now confirmed!`,
        refId: serviceDetails?._id!,
        path: '/bookings',
      });
    } catch (notifErr) {
      console.error('Failed to send user notification:', notifErr);
    }

    try {
      await NotificationServices.sendNotificationToAdmins({
        title: 'New Service Booked',
        message: `${user.name} booked ${serviceDetails?.title || 'a service'} ($${priceAmount}).`,
        refId: serviceDetails?._id!,
        path: '/bookings',
      });
    } catch (notifErr) {
      console.error('Failed to send admin notification:', notifErr);
    }

    // 5. Send Email to User
    if (user.email) {
      try {
        const userEmailData = emailTemplate.serviceBookingUserConfirmation({
          email: user.email,
          name: user.name || 'Customer',
          serviceTitle: serviceDetails?.title || 'Service',
          price: priceAmount,
          preferredDate: metadata?.preferredDate || '',
          preferredTime: metadata?.preferredTime || '',
          note: metadata?.note || '',
          transactionId: paymentTxnId,
        });
        await emailHelper.sendEmail(userEmailData);
      } catch (emailErr) {
        console.error(
          'Failed to send user service booking email:',
          emailErr,
        );
      }
    }

    // 6. Send Email to Super Admin & Admins
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
        const adminEmailData = emailTemplate.serviceBookingAdminNotification({
          adminEmail: adminEmail as string,
          customerName: user.name || 'Customer',
          customerEmail: user.email || 'N/A',
          serviceTitle: serviceDetails?.title || 'Service',
          price: priceAmount,
          preferredDate: metadata?.preferredDate || '',
          preferredTime: metadata?.preferredTime || '',
          note: metadata?.note || '',
          transactionId: paymentTxnId,
        });
        await emailHelper.sendEmail(adminEmailData);
      }
    } catch (emailErr) {
      console.error(
        'Failed to send admin service booking notification email:',
        emailErr,
      );
    }
  } catch (error) {
    mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error('[Service Booking Error]:', error);
  }
};
