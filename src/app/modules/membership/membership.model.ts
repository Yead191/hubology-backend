import { Schema, model } from 'mongoose';
import { IMembership, MembershipModel } from './membership.interface';

const membershipSchema = new Schema<IMembership, MembershipModel>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  tagline: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  recurring: {
    type: String,
    required: false,
    enum: ["month", "year"],
    default: "month"
  },
  interval: {
    type: Number,
    required: false,
    default: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  highlight: {
    type: String,
    trim: true
  },
  features: {
    type: [String],
    default: [],
    validate: {
      validator: (value: string[]) => value.length > 0,
      message: 'At least one feature is required.',
    },
  },
  paymentUrl: {
    type: String,
    required: false
  },
  productId: {
    type: String,
    required: false
  },
  priceId: {
    type: String,
    required: false
  }
},
  { timestamps: true }
);

export const Membership = model<IMembership, MembershipModel>('Membership', membershipSchema);
