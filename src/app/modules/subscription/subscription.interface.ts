import { Model } from 'mongoose';

export type ISubscription = {
  name: string
  packageId: string
  subcriptionId: String
  startDate: string
  endDate: string
  price: number
};

export type SubscriptionModel = Model<ISubscription>;
