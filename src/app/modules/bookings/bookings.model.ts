import { Schema, model } from 'mongoose';
import { IBookings, BookingsModel } from './bookings.interface';

const bookingsSchema = new Schema<IBookings, BookingsModel>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Services',
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },

    preferredTime: {
      type: String,
      required: true,
    },

    note: String,

    price: {
      type: Number,
      required: true,
    },

    updatedPrice: {
      type: Number,
      default: 0,
    },

    coupon: {
      type: String,
      default: '',
    },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: String,
  },
  {
    timestamps: true,
  },
);

export const Bookings = model<IBookings, BookingsModel>(
  'Bookings',
  bookingsSchema,
);
