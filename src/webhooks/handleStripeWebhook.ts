import { Request, Response } from 'express';
import stripe from '../config/stripe';
import config from '../config';
import { handleDonationCheckout } from '../handlers/handleDonationCheckout';
import Stripe from 'stripe';
import { handleOrderPurchase } from '../handlers/handleOrderPurchase';
import { handleMembershipCheckout } from '../handlers/handleMembershipCheckout';
import { handleServiceBooking } from '../handlers/handleServiceBooking';
import { handleDigitalPurchase } from '../handlers/handleDigitalPurchase';
import { handleInvoicePaymentSucceeded } from '../handlers/handleInvoicePaymentSucceeded';
import { handleInvoicePaymentFailed } from '../handlers/handleInvoicePaymentFailed';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhook_secret!,
      );
    } catch (err: any) {
      console.error(`Webhook Signature Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.paymentType === 'donation') {
          await handleDonationCheckout(session);
        } else if (session.metadata?.orderId) {
          await handleOrderPurchase(session);
        } else if (session.metadata?.type === 'service') {
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
        if (subscriptionCreatedSession.metadata?.membershipId) {
          await handleMembershipCheckout(subscriptionCreatedSession as any);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoicePaid = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoicePaid);
        break;

      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoiceFailed);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe Webhook Processing Error:', error);
    return res.status(500).send('Internal Server Error');
  }
};
