import { Model, Types } from 'mongoose';

export type IBookings = {
  service: Types.ObjectId;

  user: Types.ObjectId;
  preferredDate: Date;
  preferredTime: string;
  phone?: string;
  note?: string;

  price: number;
  updatedPrice?: number;

  discountType?: 'percentage' | 'fixed';
  discountAmount?: number;
  discountPercentage?: number;

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  paymentIntentId?: string;
  coupon?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type BookingsModel = Model<IBookings>;
