import mongoose from "mongoose";
import Stripe from "stripe";


export const handlePurchaseCheckout =async (data:Stripe.Checkout.Session) => {
    const mongoSession  = await mongoose.startSession()
    try {
        mongoSession.startTransaction();

        const metadata = data?.metadata

        await mongoSession.commitTransaction();
        mongoSession.endSession();
        
    } catch (error) {
        mongoSession.abortTransaction();
        mongoSession.endSession();
        console.log(error);
        
        
    }
};