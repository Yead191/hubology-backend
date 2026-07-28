import { Types } from 'mongoose';
import { Model } from 'mongoose';

export type ISubscription = {
  user: Types.ObjectId;
  plan: Types.ObjectId;
  name: string;
  status: 'active' | 'inactive' | 'cancel' | 'expire';
  start_date: Date;
  recuring?: 'Free' | 'Monthly' | 'Yearly';
  end_date: Date;
  price: number;
  features: string[];
  payment_intent_id?: string;
  trxId?: string;
};

export type SubscriptionModel = Model<ISubscription>;
