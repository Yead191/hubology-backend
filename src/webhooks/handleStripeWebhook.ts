import { Request, Response } from "express";
import stripe from "../config/stripe";
import config from "../config";
import { handlePurchaseCheckout } from "../handlers/handlePurchaseCheckout";
import { handleDonationCheckout } from "../handlers/handleDonationCheckout";
import Stripe from "stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event = await stripe.webhooks.constructEvent(req.body, sig!, config.stripe.webhook_secret!);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.paymentType === 'donation') {
                    await handleDonationCheckout(session);
                } else {
                    await handlePurchaseCheckout(session);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.log(error);
    }
}