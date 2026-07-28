import { Model } from 'mongoose';

export enum MembershipType {
  USER = 'user',
  VENDOR = 'vendor',
}

export type IMembership = {
  name: string;

  tagline: string;

  price: number;

  recurring: 'month' | 'year';

  interval: number;

  featured: boolean;

  highlight?: string;

  features: string[];

  priceId: string;
  productId: string;
  paymentUrl: string;
  type: MembershipType;
};

export type MembershipModel = Model<IMembership>;
