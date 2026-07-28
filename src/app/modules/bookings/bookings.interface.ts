import { Model, Types } from 'mongoose';

export type IBookings = {
  service: Types.ObjectId;

  user: Types.ObjectId;
  preferredDate: Date;
  preferredTime: string;

  note?: string;

  price: number;

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  paymentIntentId?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type BookingsModel = Model<IBookings>;
