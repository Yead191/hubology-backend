import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>({
  // Define schema fields here
  name: {
    type: String,
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
  subcriptionId: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
},
  { timestamps: true });

export const Subscription = model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);
