import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface'; 

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>({
  // Define schema fields here
});

export const Subscription = model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);
