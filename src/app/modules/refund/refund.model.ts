import { Schema, model } from 'mongoose';
import { IRefund, RefundModel } from './refund.interface';

const refundSchema = new Schema<IRefund, RefundModel>(
  {
    order: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    refundType: {
      type: String,
      enum: ['full', 'partial'],
      default: 'full',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'refunded', 'rejected', 'failed'],
      default: 'pending',
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
    stripeRefundId: {
      type: String,
      default: '',
      index: true,
    },
    failureReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

refundSchema.index({ order: 1, status: 1 });

export const Refund = model<IRefund, RefundModel>('Refund', refundSchema);
