import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
  {
    // Define schema fields here
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    recuring: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancel', 'expire'],
      default: 'active',
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    price: {
      type: Number,
      default: 0,
    },
    features: {
      type: [Object],
      default: [],
    },
    payment_intent_id: {
      type: String,
      default: '',
    },
    trxId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const Subscription = model<ISubscription, SubscriptionModel>(
  'Subscription',
  subscriptionSchema,
);
