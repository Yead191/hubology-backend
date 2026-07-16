import { Model } from 'mongoose';

export type IMembership = {
  name: string;

  tagline: string;

  price: number

  recurring: "month" | "year"

  interval: number

  featured: boolean;

  highlight?: string;

  features: string[];

  priceId: string,
  productId: string,
  paymentUrl: string
};

export type MembershipModel = Model<IMembership>;
