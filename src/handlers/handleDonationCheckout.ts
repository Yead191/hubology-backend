import mongoose from "mongoose";
import Stripe from "stripe";
import { Donation } from "../app/modules/iFundAyiti/donation/donation.model";
import { ProgramFund } from "../app/modules/iFundAyiti/programFund/programFund.model";

export const handleDonationCheckout = async (data: Stripe.Checkout.Session) => {
    const mongoSession = await mongoose.startSession();
    try {
        mongoSession.startTransaction();

        const metadata = data?.metadata;

        if (metadata?.paymentType === 'donation') {
            const name = metadata.name;
            const email = metadata.email;
            const amount = Number(metadata.amount);

            if (name && email && !isNaN(amount)) {
                const donations = await Donation.create(
                    [
                        {
                            name,
                            email,
                            amount,
                            type: "donation",
                            transactionId: data.id,
                        },
                    ],
                    { session: mongoSession }
                );
                // const donationDoc = donations[0];
                await ProgramFund.updateOne(
                    {}
                    ,
                    {
                        $inc: { amount: amount },
                    },
                    { session: mongoSession }
                );
            }
        }

        console.log(`[Donation] Dontation create and fund add done`)

        await mongoSession.commitTransaction();
        mongoSession.endSession();

    } catch (error) {
        mongoSession.abortTransaction();
        mongoSession.endSession();
        console.log(error);
    }
};
