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
    // console.log('service details', serviceDetails);

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

    // 4. Send Notifications & Email
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

    if (user.email) {
      try {
        // const emailData = emailTemplate.orderStatusUpdate({
        //   email: user.email,
        //   name: user.name || 'Member',
        //   orderId: membership.name,
        //   status: `Active (${membership.name})`,
        //   totalPrice: membership.price,
        // });
        // await emailHelper.sendEmail(emailData);
      } catch (emailErr) {
        console.error(
          'Failed to send subscription confirmation email:',
          emailErr,
        );
      }
    }
  } catch (error) {
    mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error('[Service Booking Error]:', error);
  }
};
