import { Request, Response } from 'express';
import stripe from '../config/stripe';
import config from '../config';
import { handlePurchaseCheckout } from '../handlers/handlePurchaseCheckout';
import { handleDonationCheckout } from '../handlers/handleDonationCheckout';
import Stripe from 'stripe';
import { handleOrderPurchase } from '../handlers/handleOrderPurchase';
import { handleMembershipCheckout } from '../handlers/handleMembershipCheckout';
import { handleServiceBooking } from '../handlers/handleServiceBooking';
import { handleDigitalPurchase } from '../handlers/handleDigitalPurchase';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event = await stripe.webhooks.constructEvent(
      req.body,
      sig!,
      config.stripe.webhook_secret!,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // console.log('sesstion================>>', session);
        if (session.metadata?.paymentType === 'donation') {
          await handleDonationCheckout(session);
        } else if (session.metadata?.orderId) {
          await handleOrderPurchase(session);
        } else if (session.metadata?.type === 'service') {
          // console.log('service');
          await handleServiceBooking(session);
        } else if (session?.metadata?.type === 'digital-shop') {
          await handleDigitalPurchase(session);
        } else if (session.metadata?.membershipId) {
          await handleMembershipCheckout(session);
        }
        break;
      case 'customer.subscription.created':
        const subscriptionCreatedSession = event.data
          .object as Stripe.Subscription;
        // console.log(subscriptionCreatedSession);
        if (subscriptionCreatedSession.metadata?.membershipId) {
          await handleMembershipCheckout(subscriptionCreatedSession as any);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.log(error);
  }
};
